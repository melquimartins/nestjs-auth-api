import * as dotenv from "dotenv";

dotenv.config({ path: ".env.test", quiet: true });

import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";

import { AppModule } from "@/app.module";
import { PrismaService } from "@/db/prisma.service";
import { UpdatePasswordRequestDto } from "../dto/update-password-request.dto";
import { UpdateUserRequestDto } from "../dto/update-user-request.dto";

describe("UserController (E2E)", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let authCookie: string;

    const defaultUser = {
        name: "Usuário User E2E",
        email: "user.e2e@exemplo.com",
        password: "senhaUser@123",
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        prismaService = module.get<PrismaService>(PrismaService);

        app.use(cookieParser());
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

        const signUpRes = await request(app.getHttpServer())
            .post("/api/auth/sign-up")
            .send(defaultUser)
            .expect(HttpStatus.CREATED);

        const cookies = signUpRes.headers["set-cookie"];
        authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    });

    afterAll(async () => {
        await app.close();
    });

    describe("GET /api/users/me", () => {
        it("deve retornar os dados do perfil do usuário autenticado", async () => {
            const response = await request(app.getHttpServer())
                .get("/api/users/me")
                .set("Cookie", [authCookie])
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("Perfil obtido com sucesso.");
            expect(response.body.data.email).toEqual(defaultUser.email);
            expect(response.body.data.name).toEqual(defaultUser.name);
            expect(response.body.data).not.toHaveProperty("password");
        });

        it("deve retornar 401 Unauthorized se o cookie de autenticação não for enviado", async () => {
            await request(app.getHttpServer()).get("/api/users/me").expect(HttpStatus.UNAUTHORIZED);
        });
    });

    describe("PATCH /api/users/me", () => {
        it("deve atualizar o nome no perfil mediante confirmação de senha correta", async () => {
            const payload: UpdateUserRequestDto = {
                name: "Usuário User Nome Alterado",
                password: defaultUser.password,
            };

            const response = await request(app.getHttpServer())
                .patch("/api/users/me")
                .set("Cookie", [authCookie])
                .send(payload)
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("Perfil atualizado com sucesso.");
            expect(response.body.data.name).toEqual("Usuário User Nome Alterado");
        });

        it("deve retornar 401 se a senha informada for incorreta", async () => {
            const payload: UpdateUserRequestDto = {
                name: "Novo Nome",
                password: "senhaErrada123",
            };

            const response = await request(app.getHttpServer())
                .patch("/api/users/me")
                .set("Cookie", [authCookie])
                .send(payload)
                .expect(HttpStatus.UNAUTHORIZED);

            expect(response.body.message).toEqual("Credenciais inválidas.");
        });
    });

    describe("POST /api/users/email e PATCH /api/users/email/confirm/:token", () => {
        let confirmationToken: string;
        const newEmail = "novo.email.user.e2e@exemplo.com";

        it("deve solicitar a alteração de e-mail e retornar o link com o token", async () => {
            const response = await request(app.getHttpServer())
                .post("/api/users/email")
                .set("Cookie", [authCookie])
                .send({
                    newEmail,
                    password: defaultUser.password,
                })
                .expect(HttpStatus.ACCEPTED);

            expect(response.body.message).toEqual("Instruções de confirmação enviadas para o e-mail informado.");
            const link: string = response.body.data.link;
            confirmationToken = link.split("/").pop()!;
        });

        it("deve confirmar a alteração de e-mail com o token gerado", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/users/email/confirm/${confirmationToken}`)
                .set("Cookie", [authCookie])
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("E-mail alterado com sucesso.");

            const profileRes = await request(app.getHttpServer())
                .get("/api/users/me")
                .set("Cookie", [authCookie])
                .expect(HttpStatus.OK);

            expect(profileRes.body.data.email).toEqual(newEmail);
        });
    });

    describe("PATCH /api/users/password", () => {
        it("deve alterar a senha do usuário autenticado com sucesso", async () => {
            const newPassword = "novaSenhaUser@123";
            const payload: UpdatePasswordRequestDto = {
                currentPassword: defaultUser.password,
                newPassword,
            };

            const response = await request(app.getHttpServer())
                .patch("/api/users/password")
                .set("Cookie", [authCookie])
                .send(payload)
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("Senha alterada com sucesso.");

            defaultUser.password = newPassword;
        });

        it("deve retornar 400 se a nova senha for igual à atual", async () => {
            const payload: UpdatePasswordRequestDto = {
                currentPassword: defaultUser.password,
                newPassword: defaultUser.password,
            };

            const response = await request(app.getHttpServer())
                .patch("/api/users/password")
                .set("Cookie", [authCookie])
                .send(payload)
                .expect(HttpStatus.BAD_REQUEST);

            expect(response.body.message).toEqual("A nova senha deve ser diferente da atual.");
        });
    });

    describe("DELETE /api/users/me", () => {
        it("deve excluir a conta do usuário e limpar o cookie de autenticação", async () => {
            const response = await request(app.getHttpServer())
                .delete("/api/users/me")
                .set("Cookie", [authCookie])
                .send({ password: defaultUser.password })
                .expect(HttpStatus.OK);

            expect(response.body.message).toEqual("Conta excluída com sucesso.");
            expect(response.headers["set-cookie"]).toEqual(
                expect.arrayContaining([expect.stringContaining("access_token=;")]),
            );

            await request(app.getHttpServer())
                .get("/api/users/me")
                .set("Cookie", [authCookie])
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });
});
