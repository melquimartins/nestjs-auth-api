import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Res } from "@nestjs/common";
import {
    ApiAcceptedResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Response } from "express";

import { EnvService } from "@/config/env/env-service";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import { AuthService } from "./auth.service";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "./dto/reset-password-request.dto";
import { SignInRequestDto } from "./dto/sign-in-request.dto";
import { SignUpRequestDto } from "./dto/sign-up-request.dto";

@ApiTags("Autenticação")
@Controller("auth")
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly envService: EnvService,
    ) {}

    @ApiOperation({
        summary: "Realizar login",
        description: "Realiza a autenticação do usuário e anexa o cookie de autenticação access_token na resposta.",
    })
    @ApiOkResponse({
        description: "Autenticação realizada com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Credenciais inválidas.",
    })
    @Post("sign-in")
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() request: SignInRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        this.attachAuthCookie(response, await this.service.signIn(request));

        return new ResponseEnvelopeDto("Autenticação realizada com sucesso.");
    }

    @ApiOperation({
        summary: "Cadastrar conta",
        description: "Cria uma nova conta de usuário no sistema e efetua o login automático.",
    })
    @ApiCreatedResponse({
        description: "Conta criada com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiConflictResponse({
        description: "E-mail já cadastrado.",
    })
    @Post("sign-up")
    @HttpCode(HttpStatus.CREATED)
    async signUp(
        @Body() request: SignUpRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        this.attachAuthCookie(response, await this.service.signUp(request));

        return new ResponseEnvelopeDto("Conta criada com sucesso.");
    }

    private attachAuthCookie(response: Response, token: string): void {
        response.cookie("access_token", token, {
            httpOnly: true,
            secure: this.envService.getNodeEnv() === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24,
            path: "/",
        });
    }

    @ApiOperation({
        summary: "Solicitar recuperação de senha",
        description: "Gera um link contendo o token de recuperação de senha com validade de 15 minutos.",
    })
    @ApiAcceptedResponse({
        description: "Instruções de recuperação enviadas caso o e-mail esteja cadastrado.",
        type: ResponseEnvelopeDto,
    })
    @Post("password/forgot")
    @HttpCode(HttpStatus.ACCEPTED)
    async forgotPassword(@Body() request: ForgotPasswordRequestDto): Promise<
        ResponseEnvelopeDto<{
            link: string | null;
        }>
    > {
        const link = await this.service.forgotPassword(request);

        return new ResponseEnvelopeDto("Se o e-mail estiver cadastrado, as instruções serão enviadas.", {
            link,
        });
    }

    @ApiOperation({
        summary: "Redefinir senha com token",
        description: "Redefine a senha da conta de usuário utilizando o token de recuperação recebido.",
    })
    @ApiOkResponse({
        description: "Senha redefinida com sucesso.",
        type: ResponseEnvelopeDto,
    })
    @ApiUnauthorizedResponse({
        description: "Token inválido ou expirado.",
    })
    @Patch("password/reset/:token")
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Param("token") token: string,
        @Body() request: ResetPasswordRequestDto,
    ): Promise<ResponseEnvelopeDto> {
        await this.service.resetPassword(token, request);

        return new ResponseEnvelopeDto("Senha redefinida com sucesso.");
    }
}
