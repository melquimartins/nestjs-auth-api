import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import type { User } from "generated/prisma/client";
import { JwtAuthGuard } from "@/security/jwt-auth.guard";
import { CurrentUser } from "@/shared/decorators/current-user.decorator";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import { DeleteUserRequestDto } from "./dto/delete-user-request.dto";
import { UpdateEmailRequestDto } from "./dto/update-email-request.dto";
import { UpdatePasswordRequestDto } from "./dto/update-password-request.dto";
import { UpdateUserRequestDto } from "./dto/update-user-request.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserMapper } from "./user.mapper";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly mapper: UserMapper,
    ) {}

    @Get("me")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.getProfile(user));

        return new ResponseEnvelopeDto("Perfil obtido com sucesso.", response);
    }

    @Patch("me")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Body() request: UpdateUserRequestDto,
        @CurrentUser() user: User,
    ): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.updateProfile(user, request));

        return new ResponseEnvelopeDto<UserResponseDto>("Perfil atualizado com sucesso.", response);
    }

    @Post("email")
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(JwtAuthGuard)
    async requestEmailUpdate(
        @CurrentUser() user: User,
        @Body() request: UpdateEmailRequestDto,
    ): Promise<ResponseEnvelopeDto<{ link: string }>> {
        const link = await this.service.requestEmailUpdate(user, request);

        return new ResponseEnvelopeDto("Instruções de confirmação enviadas para o e-mail informado.", { link });
    }

    @Patch("email/confirm/:token")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async confirmEmailUpdate(@CurrentUser() user: User, @Param("token") token: string): Promise<ResponseEnvelopeDto> {
        await this.service.confirmEmailUpdate(user, token);

        return new ResponseEnvelopeDto("E-mail alterado com sucesso.");
    }

    @Patch("password")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updatePassword(
        @CurrentUser() user: User,
        @Body() request: UpdatePasswordRequestDto,
    ): Promise<ResponseEnvelopeDto> {
        await this.service.updatePassword(user, request);

        return new ResponseEnvelopeDto("Senha alterada com sucesso.");
    }

    @Delete("me")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async deleteAccount(
        @CurrentUser() user: User,
        @Body() request: DeleteUserRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        await this.service.deleteAccount(user, request);

        response.clearCookie("access_token", { path: "/" });

        return new ResponseEnvelopeDto("Conta excluída com sucesso.");
    }
}
