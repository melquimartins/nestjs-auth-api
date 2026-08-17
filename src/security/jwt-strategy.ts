import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import type { User } from "generated/prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";

import { EnvService } from "@/config/env/env-service";
import { UserRepository } from "@/domain/user/user.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        readonly envService: EnvService,
        private readonly userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.access_token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: envService.getJwtSecret(),
        });
    }

    async validate(payload: { id: number }): Promise<User> {
        const user = await this.userRepository.findById(payload.id);

        if (!user) {
            throw new UnauthorizedException("Credenciais inválidas ou usuário não encontrado");
        }

        return user;
    }
}
