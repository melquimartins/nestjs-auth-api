import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";

import type { User } from "generated/prisma/client";
import { JwtAuthGuard } from "@/security/jwt-auth.guard";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import type { UserResponseDto } from "./dto/user-response.dto";
import { UserMapper } from "./user.mapper";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly mapper: UserMapper,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async get(@CurrentUser() user: User): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.get(user));

        return new ResponseEnvelopeDto("Usuário encontrado com sucesso.", response);
    }
}
