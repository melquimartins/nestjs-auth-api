import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Res } from "@nestjs/common";
import type { Response } from "express";

import { EnvService } from "@/config/env/env-service";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import { AuthService } from "./auth.service";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "./dto/reset-password-request.dto";
import { SignInRequestDto } from "./dto/sign-in-request.dto";
import { SignUpRequestDto } from "./dto/sign-up-request.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly envService: EnvService,
    ) {}

    @Post("sign-in")
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() request: SignInRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        this.attachAuthCookie(response, await this.service.signIn(request));

        return new ResponseEnvelopeDto("Autenticação realizada com sucesso.");
    }

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
