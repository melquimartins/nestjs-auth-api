import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";

import type { User } from "generated/prisma/client";
import { JwtAuthGuard } from "@/security/jwt-auth.guard";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
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

    @Patch()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async patch(
        @Body() request: UpdateUserDto,
        @CurrentUser() user: User,
    ): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.update(user, request));

        return new ResponseEnvelopeDto<UserResponseDto>("Usuário atualizado com sucesso.", response);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async delete(
        @CurrentUser() user: User,
        @Body() request: DeleteUserDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        await this.service.delete(user, request);

        response.clearCookie("access_token", { path: "/" });

        return new ResponseEnvelopeDto("Usuário deletado com sucesso.");
    }
}
