import { BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";

import { DeleteUserRequestDto } from "../dto/delete-user-request.dto";
import { UpdateEmailRequestDto } from "../dto/update-email-request.dto";
import { UpdatePasswordRequestDto } from "../dto/update-password-request.dto";
import { UpdateUserRequestDto } from "../dto/update-user-request.dto";
import { UserRepository } from "../user.repository";
import { UserService } from "../user.service";

jest.mock("bcrypt");

describe("UserService", () => {
    let service: UserService;

    const mockUserRepository = {
        findByEmail: jest.fn(),
        existsByEmail: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    const mockUser = {
        id: 1,
        name: "Usuário de Teste",
        email: "usuario@exemplo.com",
        password: "$2b$10$hashSenhaMockada",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
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

        service = module.get<UserService>(UserService);
    });

    describe("getProfile", () => {
        it("deve retornar o perfil do usuário", async () => {
            const result = await service.getProfile(mockUser);

            expect(result).toEqual(mockUser);
        });
    });

    describe("updateProfile", () => {
        const request: UpdateUserRequestDto = {
            name: "Usuário Atualizado",
            password: "senhaA@123",
        };

        it("deve atualizar o perfil do usuário com sucesso", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockUserRepository.update.mockResolvedValue({ ...mockUser, name: request.name });

            const result = await service.updateProfile(mockUser, request);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { name: request.name });
            expect(bcrypt.compare).toHaveBeenCalledWith(request.password, mockUser.password);
            expect(result).toEqual({ ...mockUser, name: request.name });
        });

        it("deve lançar UnauthorizedException se a senha estiver incorreta", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.updateProfile(mockUser, request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });

        it("deve retornar o perfil do usuário sem alterações se o nome não for alterado", async () => {
            const request: UpdateUserRequestDto = {
                name: mockUser.name,
                password: "senhaA@123",
            };

            mockUserRepository.update.mockResolvedValue({ ...mockUser, name: request.name });
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const result = await service.updateProfile(mockUser, request);

            expect(result).toEqual(mockUser);
        });
    });

    describe("updatePassword", () => {
        it("deve atualizar a senha do usuário", async () => {
            const request: UpdatePasswordRequestDto = {
                currentPassword: "senhaA@123",
                newPassword: "senhaNovaA@123",
            };

            const hashedPassword = "$2b$10$hashSenhaNovaMockada";

            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

            jest.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

            mockUserRepository.update.mockResolvedValue({ ...mockUser, password: hashedPassword });

            await service.updatePassword(mockUser, request);

            expect(bcrypt.compare).toHaveBeenNthCalledWith(1, request.currentPassword, mockUser.password);
            expect(bcrypt.compare).toHaveBeenNthCalledWith(2, request.newPassword, mockUser.password);
            expect(bcrypt.hash).toHaveBeenCalledWith(request.newPassword, 12);
            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { password: hashedPassword });
        });

        it("deve lançar UnauthorizedException se a senha atual estiver incorreta", async () => {
            const request: UpdatePasswordRequestDto = {
                currentPassword: "senhaIncorreta",
                newPassword: "senhaNovaA@123",
            };

            jest.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

            await expect(service.updatePassword(mockUser, request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });

        it("deve lançar BadRequestException se a nova senha for igual à senha atual", async () => {
            const request: UpdatePasswordRequestDto = {
                currentPassword: "senhaA@123",
                newPassword: "senhaA@123",
            };

            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

            await expect(service.updatePassword(mockUser, request)).rejects.toThrow(BadRequestException);

            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe("requestEmailUpdate", () => {
        const request: UpdateEmailRequestDto = {
            newEmail: "novoemail@exemplo.com",
            password: "senhaA@123",
        };

        it("deve gerar a URL de confirmação de alteração de e-mail com sucesso", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockUserRepository.existsByEmail.mockResolvedValue(false);
            mockJwtService.signAsync.mockResolvedValue("token_jwt_mockado");

            const result = await service.requestEmailUpdate(mockUser, request);

            expect(bcrypt.compare).toHaveBeenCalledWith(request.password, mockUser.password);
            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(request.newEmail);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(
                { userId: mockUser.id, newEmail: request.newEmail },
                { expiresIn: "30m" },
            );
            expect(result).toBe("http://localhost:3000/api/users/email/confirm/token_jwt_mockado");
        });

        it("deve lançar UnauthorizedException se a senha estiver incorreta", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.requestEmailUpdate(mockUser, request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it("deve lançar BadRequestException se o novo e-mail for igual ao e-mail atual", async () => {
            const requestSameEmail: UpdateEmailRequestDto = {
                newEmail: mockUser.email,
                password: "senhaA@123",
            };

            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

            await expect(service.requestEmailUpdate(mockUser, requestSameEmail)).rejects.toThrow(BadRequestException);

            expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it("deve lançar ConflictException se o novo e-mail já estiver cadastrado", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(service.requestEmailUpdate(mockUser, request)).rejects.toThrow(ConflictException);

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(request.newEmail);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });

    describe("confirmEmailUpdate", () => {
        const token = "token_valido";
        const payload = { userId: mockUser.id, newEmail: "novoemail@exemplo.com" };

        it("deve confirmar e atualizar o e-mail do usuário com sucesso", async () => {
            mockJwtService.verifyAsync.mockResolvedValue(payload);
            mockUserRepository.existsByEmail.mockResolvedValue(false);
            mockUserRepository.update.mockResolvedValue(undefined);

            await service.confirmEmailUpdate(mockUser, token);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(payload.newEmail);
            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { email: payload.newEmail });
        });

        it("deve lançar UnauthorizedException se o userId do token não corresponder ao usuário", async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ userId: 999, newEmail: "novoemail@exemplo.com" });

            await expect(service.confirmEmailUpdate(mockUser, token)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });

        it("deve lançar ConflictException se o e-mail do token já tiver sido cadastrado", async () => {
            mockJwtService.verifyAsync.mockResolvedValue(payload);
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(service.confirmEmailUpdate(mockUser, token)).rejects.toThrow(ConflictException);

            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });

        it("deve lançar UnauthorizedException se a verificação do token falhar", async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error("Token expirado"));

            await expect(service.confirmEmailUpdate(mockUser, token)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe("deleteAccount", () => {
        const request: DeleteUserRequestDto = {
            password: "senhaA@123",
        };

        it("deve deletar a conta do usuário com sucesso", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockUserRepository.delete.mockResolvedValue(undefined);

            await service.deleteAccount(mockUser, request);

            expect(bcrypt.compare).toHaveBeenCalledWith(request.password, mockUser.password);
            expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUser.id);
        });

        it("deve lançar UnauthorizedException se a senha estiver incorreta", async () => {
            jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.deleteAccount(mockUser, request)).rejects.toThrow(UnauthorizedException);

            expect(mockUserRepository.delete).not.toHaveBeenCalled();
        });
    });
});
