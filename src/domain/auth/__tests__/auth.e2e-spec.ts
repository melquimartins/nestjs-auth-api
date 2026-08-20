import * as dotenv from "dotenv";

dotenv.config({ path: ".env.test", quiet: true });

import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "@/app.module";
import { PrismaService } from "@/db/prisma.service";
import { SignInRequestDto } from "../dto/sign-in-request.dto";
import { SignUpRequestDto } from "../dto/sign-up-request.dto";

describe("AuthController", () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        prismaService = module.get<PrismaService>(PrismaService);

        app.setGlobalPrefix("api");
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                stopAtFirstError: true,
                transform: true,
            }),
        );

        await app.init();
        await prismaService.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    describe("POST /api/auth/sign-up", () => {
        const payload: SignUpRequestDto = {
            name: "Usuário de Teste",
            email: "usuario@exemplo.com",
            password: "senhaA@123",
        };

        it("deve criar um novo usuário e anexar o cookie de autenticação access_token na resposta", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/sign-up")
                .send(payload)
                .expect(HttpStatus.CREATED);

            expect(response.headers["set-cookie"]).toEqual(
                expect.arrayContaining([expect.stringContaining("access_token")]),
            );
            expect(response.body.message).toEqual("Conta criada com sucesso.");
        });

        it("deve retornar erro ao tentar criar conta com e-mail já cadastrado", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/sign-up")
                .send(payload)
                .expect(HttpStatus.CONFLICT);

            expect(response.body.message).toEqual("E-mail já cadastrado.");
        });
    });

    describe("POST /api/auth/sign-in", () => {
        it("deve autenticar o usuário e anexar o cookie de autenticação access_token na resposta", async () => {
            const payload: SignInRequestDto = {
                email: "usuario@exemplo.com",
                password: "senhaA@123",
            };

            const response = await request(app.getHttpServer())
                .post("/api/auth/sign-in")
                .send(payload)
                .expect(HttpStatus.OK);

            expect(response.headers["set-cookie"]).toEqual(
                expect.arrayContaining([expect.stringContaining("access_token")]),
            );
            expect(response.body.message).toEqual("Autenticação realizada com sucesso.");
        });

        it("deve retornar erro ao tentar autenticar com email errado", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/sign-in")
                .send({ email: "email.inexistente@exemplo.com", password: "senhaA@123" })
                .expect(HttpStatus.UNAUTHORIZED);

            expect(response.body.message).toEqual("Credenciais inválidas.");
        });

        it("deve retornar erro ao tentar autenticar com senha errada", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/sign-in")
                .send({ email: "usuario@exemplo.com", password: "senhaErrada" })
                .expect(HttpStatus.UNAUTHORIZED);

            expect(response.body.message).toEqual("Credenciais inválidas.");
        });
    });

    describe("POST /api/auth/password/forgot", () => {
        it("deve retornar mensagem genérica ao solicitar recuperação de senha", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/auth/password/forgot")
                .send({ email: "usuario@exemplo.com" })
                .expect(HttpStatus.ACCEPTED);

            expect(response.body.message).toEqual("Se o e-mail estiver cadastrado, as instruções serão enviadas.");
            expect(response.body.data).toHaveProperty("link");
        });
    });

    describe("PATCH /api/auth/password/reset/:token", () => {
        it("deve redefinir a senha do usuário utilizando um token de recuperação válido", async () => {
            const forgotResponse = await request(app.getHttpServer())
                .post("/api/auth/password/forgot")
                .send({ email: "usuario@exemplo.com" });

            const link: string = forgotResponse.body.data.link;
            const token = link.split("/").pop();

            const response = await request(app.getHttpServer())
                .patch(`/api/auth/password/reset/${token}`)
                .send({ password: "novaSenha@123" })
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("Senha redefinida com sucesso.");

            await request(app.getHttpServer())
                .post("/api/auth/sign-in")
                .send({ email: "usuario@exemplo.com", password: "novaSenha@123" })
                .expect(HttpStatus.OK);
        });

        it("deve retornar erro 401 ao passar um token inválido", async () => {
            const response = await request(app.getHttpServer())
                .patch("/api/auth/password/reset/token_invalido")
                .send({ password: "novaSenha@123" })
                .expect(HttpStatus.UNAUTHORIZED);

            expect(response.body.message).toEqual("Token inválido ou expirado.");
        });
    });
});
