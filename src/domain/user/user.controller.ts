import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import type { User } from "generated/prisma/client";
import { JwtAuthGuard } from "src/security/jwt-auth.guard";
import { GetUser } from "src/shared/decorators/params/get-user.decorator";
import { ResponseEnvelopeDto } from "src/shared/dto/response-envelope.dto";
import { UserResponseDto } from "./dto/user-response.dto";
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
    async get(@GetUser() user: User): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.get(user));

        return new ResponseEnvelopeDto("Usuário encontrado com sucesso.", response);
    }
}
