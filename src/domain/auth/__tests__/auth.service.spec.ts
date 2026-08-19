import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";

import { UserRepository } from "@/domain/user/user.repository";
import { AuthService } from "../auth.service";
import { ForgotPasswordRequestDto } from "../dto/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "../dto/reset-password-request.dto";
import { SignInRequestDto } from "../dto/sign-in-request.dto";
import { SignUpRequestDto } from "../dto/sign-up-request.dto";

jest.mock("bcrypt");

describe("AuthService", () => {
    let service: AuthService;

    const mockUserRepository = {
        findByEmail: jest.fn(),
        existsByEmail: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe("signIn", () => {
        const request: SignInRequestDto = {
            email: "usuario@exemplo.com",
            password: "senhaA@123",
        };

        const mockUser = {
            id: "1",
            email: "usuario@exemplo.com",
            password: "$2b$10$hashSenhaMockada",
        };

        it("deve autenticar o usuário e retornar um token JWT válido", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockJwtService.signAsync.mockResolvedValue("token_jwt_gerado");

            const result = await service.signIn(request);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(request.password, mockUser.password);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: mockUser.id });
            expect(result).toBe("token_jwt_gerado");
        });

        it("deve lançar UnauthorizedException se o e-mail não estiver cadastrado", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            await expect(service.signIn(request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it("deve lançar UnauthorizedException se a senha estiver incorreta", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.signIn(request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(request.password, mockUser.password);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });

    describe("signUp", () => {
        const request: SignUpRequestDto = {
            name: "Usuário de Teste",
            email: "usuario@exemplo.com",
            password: "senhaA@123",
        };

        it("deve criar um novo usuário e retornar um token JWT válido", async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false);
            jest.mocked(bcrypt.hash).mockResolvedValue("$2b$10$hashSenhaMockada" as never);
            mockUserRepository.create.mockResolvedValue({
                id: "1",
                name: "Usuário de Teste",
                email: "usuario@exemplo.com",
                password: "$2b$10$hashSenhaMockada",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockJwtService.signAsync.mockResolvedValue("token_jwt_gerado");

            const result = await service.signUp(request);

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(request.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(request.password, 12);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                name: request.name,
                email: request.email,
                password: "$2b$10$hashSenhaMockada",
            });
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: "1" });
            expect(result).toBe("token_jwt_gerado");
        });

        it("deve lançar ConflictException se o e-mail já estiver cadastrado", async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(service.signUp(request)).rejects.toThrow(ConflictException);

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(request.email);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });

    describe("forgotPassword", () => {
        const request: ForgotPasswordRequestDto = { email: "usuario@exemplo.com" };

        const mockUser = {
            id: "1",
            email: "usuario@exemplo.com",
        };

        it("deve gerar um token de recuperação se o e-mail estiver cadastrado", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockJwtService.signAsync.mockResolvedValue("token_jwt_gerado");

            const result = await service.forgotPassword(request);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: "1" }, { expiresIn: "15m" });
            expect(result).toBe("http://localhost:3000/api/auth/password/reset/token_jwt_gerado");
        });

        it("deve retornar null se o e-mail não estiver cadastrado", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            const result = await service.forgotPassword(request);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe("resetPassword", () => {
        const token = "token_jwt_gerado";

        const request: ResetPasswordRequestDto = {
            password: "nova_senha@123",
        };

        it("deve resetar a senha se o token for válido", async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ id: "1" });
            mockUserRepository.findById.mockResolvedValue({
                id: "1",
                email: "usuario@exemplo.com",
                password: "senha_antiga",
            });
            jest.mocked(bcrypt.hash).mockResolvedValue("senha_nova_hash" as never);
            mockUserRepository.update.mockResolvedValue(undefined);

            await service.resetPassword(token, request);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
            expect(mockUserRepository.findById).toHaveBeenCalledWith("1");
            expect(bcrypt.hash).toHaveBeenCalledWith(request.password, 12);
            expect(mockUserRepository.update).toHaveBeenCalledWith("1", { password: "senha_nova_hash" });
        });

        it("deve lançar UnauthorizedException se o token for inválido", async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error());

            await expect(service.resetPassword(token, request)).rejects.toThrow(UnauthorizedException);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
            expect(mockUserRepository.findById).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });

        it("deve lançar UnauthorizedException se o usuário não for encontrado", async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ id: "1" });
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.resetPassword(token, request)).rejects.toThrow(UnauthorizedException);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
            expect(mockUserRepository.findById).toHaveBeenCalledWith("1");
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });
    });
});
