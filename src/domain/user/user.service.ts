import {
    BadRequestException,
    ConflictException,
    HttpException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import type { User } from "generated/prisma/client";
import { DeleteUserRequestDto } from "./dto/delete-user-request.dto";
import { UpdateEmailRequestDto } from "./dto/update-email-request.dto";
import { UpdatePasswordRequestDto } from "./dto/update-password-request.dto";
import { UpdateUserRequestDto } from "./dto/update-user-request.dto";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
    constructor(
        private readonly repository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async getProfile(user: User): Promise<User> {
        return user;
    }

    async updateProfile(user: User, request: UpdateUserRequestDto): Promise<User> {
        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("Credenciais inválidas.");
        }

        if (request.name === user.name) {
            return user;
        }

        return await this.repository.update(user.id, {
            name: request.name,
        });
    }

    async updatePassword(user: User, request: UpdatePasswordRequestDto): Promise<void> {
        if (!(await bcrypt.compare(request.currentPassword, user.password))) {
            throw new UnauthorizedException("Credenciais inválidas.");
        }

        if (await bcrypt.compare(request.newPassword, user.password)) {
            throw new BadRequestException("A nova senha deve ser diferente da atual.");
        }

        const hashedPassword = await bcrypt.hash(request.newPassword, 12);

        await this.repository.update(user.id, { password: hashedPassword });
    }

    async requestEmailUpdate(user: User, request: UpdateEmailRequestDto): Promise<string> {
        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("Credenciais inválidas.");
        }

        if (user.email === request.newEmail) {
            throw new BadRequestException("O novo e-mail deve ser diferente do atual.");
        }

        if (await this.repository.existsByEmail(request.newEmail)) {
            throw new ConflictException("E-mail já cadastrado.");
        }

        const token = await this.jwtService.signAsync(
            { userId: user.id, newEmail: request.newEmail },
            { expiresIn: "30m" },
        );

        return `http://localhost:3000/api/users/email/confirm/${token}`;
    }

    async confirmEmailUpdate(user: User, token: string): Promise<void> {
        try {
            const payload = await this.jwtService.verifyAsync<{ userId: number; newEmail: string }>(token);

            if (payload.userId !== user.id) {
                throw new UnauthorizedException("Credenciais inválidas.");
            }

            if (await this.repository.existsByEmail(payload.newEmail)) {
                throw new ConflictException("E-mail já cadastrado.");
            }

            await this.repository.update(user.id, {
                email: payload.newEmail,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new UnauthorizedException("Token de confirmação inválido ou expirado.");
        }
    }

    async deleteAccount(user: User, request: DeleteUserRequestDto): Promise<void> {
        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("Senha incorreta.");
        }

        await this.repository.delete(user.id);
    }
}
