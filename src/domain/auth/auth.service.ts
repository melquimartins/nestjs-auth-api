import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UserRepository } from "../user/user.repository";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "./dto/reset-password-request.dto";
import type { SignInRequestDto } from "./dto/sign-in-request.dto";
import type { SignUpRequestDto } from "./dto/sign-up-request.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly repository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(request: SignInRequestDto): Promise<string> {
        const user = await this.repository.findByEmail(request.email);

        if (!user) {
            throw new UnauthorizedException("Credenciais inválidas.");
        }

        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("Credenciais inválidas.");
        }

        return await this.jwtService.signAsync({ id: user.id });
    }

    async signUp(request: SignUpRequestDto): Promise<string> {
        if (await this.repository.existsByEmail(request.email)) {
            throw new ConflictException("E-mail já cadastrado.");
        }

        const hashedPassword = await bcrypt.hash(request.password, 12);

        const user = await this.repository.create({
            email: request.email,
            name: request.name,
            password: hashedPassword,
        });

        return await this.jwtService.signAsync({ id: user.id });
    }

    async forgotPassword(request: ForgotPasswordRequestDto): Promise<string | null> {
        const user = await this.repository.findByEmail(request.email);

        if (!user) {
            return null;
        }

        const token = await this.jwtService.signAsync({ id: user.id }, { expiresIn: "15m" });

        return `http://localhost:3000/api/auth/password/reset/${token}`;
    }

    async resetPassword(token: string, request: ResetPasswordRequestDto): Promise<void> {
        try {
            const payload = await this.jwtService.verifyAsync<{ id: number }>(token);

            const user = await this.repository.findById(payload.id);

            if (!user) {
                throw new UnauthorizedException("Token inválido ou usuário não encontrado.");
            }

            const hashedPassword = await bcrypt.hash(request.password, 12);

            await this.repository.update(user.id, { password: hashedPassword });
        } catch {
            throw new UnauthorizedException("Token inválido ou expirado.");
        }
    }
}
