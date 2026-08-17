import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UserRepository } from "../user/user.repository";
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
            throw new UnauthorizedException("As credenciais informadas são inválidas.");
        }

        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("As credenciais informadas são inválidas.");
        }

        return await this.jwtService.signAsync({ id: user.id });
    }

    async signUp(request: SignUpRequestDto): Promise<string> {
        if (await this.repository.existsByEmail(request.email)) {
            throw new ConflictException("Este e-mail já está vinculado a uma conta.");
        }

        const hashedPassword = await bcrypt.hash(request.password, 12);

        const user = await this.repository.create({
            email: request.email,
            name: request.name,
            password: hashedPassword,
        });

        return await this.jwtService.signAsync({ id: user.id });
    }
}
