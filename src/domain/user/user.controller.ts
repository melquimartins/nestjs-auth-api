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
import {
    ApiAcceptedResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
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

@ApiTags("Usuários")
@Controller("users")
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly mapper: UserMapper,
    ) {}

    @ApiOperation({
        summary: "Obter perfil do usuário",
        description: "Retorna os dados cadastrais do usuário atualmente autenticado.",
    })
    @ApiOkResponse({
        description: "Perfil obtido com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Não autorizado (cookie ausente ou inválido).",
    })
    @Get("me")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: User): Promise<ResponseEnvelopeDto<UserResponseDto>> {
        const response = await this.mapper.toResponse(await this.service.getProfile(user));

        return new ResponseEnvelopeDto("Perfil obtido com sucesso.", response);
    }

    @ApiOperation({
        summary: "Atualizar perfil",
        description: "Atualiza os dados cadastrais (como nome) do usuário autenticado mediante confirmação de senha.",
    })
    @ApiOkResponse({
        description: "Perfil atualizado com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Credenciais inválidas.",
    })
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

    @ApiOperation({
        summary: "Solicitar alteração de e-mail principal",
        description: "Envia um link de confirmação com token temporário (30 min) para o novo e-mail informado.",
    })
    @ApiAcceptedResponse({
        description: "Instruções de confirmação enviadas para o e-mail informado.",
        type: ResponseEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description: "O novo e-mail deve ser diferente do atual.",
    })
    @ApiConflictResponse({
        description: "E-mail já cadastrado.",
    })
    @ApiUnauthorizedResponse({
        description: "Credenciais inválidas.",
    })
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

    @ApiOperation({
        summary: "Confirmar alteração de e-mail principal",
        description: "Valida o token recebido e atualiza o endereço de e-mail principal da conta.",
    })
    @ApiOkResponse({
        description: "E-mail alterado com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Token de confirmação inválido ou expirado.",
    })
    @ApiConflictResponse({
        description: "E-mail já cadastrado.",
    })
    @Patch("email/confirm/:token")
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async confirmEmailUpdate(@CurrentUser() user: User, @Param("token") token: string): Promise<ResponseEnvelopeDto> {
        await this.service.confirmEmailUpdate(user, token);

        return new ResponseEnvelopeDto("E-mail alterado com sucesso.");
    }

    @ApiOperation({
        summary: "Alterar senha da conta",
        description: "Altera a senha do usuário autenticado validando a senha atual informada.",
    })
    @ApiOkResponse({
        description: "Senha alterada com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiBadRequestResponse({
        description: "A nova senha deve ser diferente da atual.",
    })
    @ApiUnauthorizedResponse({
        description: "Credenciais inválidas.",
    })
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

    @ApiOperation({
        summary: "Excluir conta de usuário",
        description: "Exclui permanentemente a conta do usuário logado e remove o cookie de autenticação access_token.",
    })
    @ApiOkResponse({
        description: "Conta excluída com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Senha incorreta.",
    })
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
