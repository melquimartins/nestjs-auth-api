import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";

import { EnvService } from "@/config/env/env-service";
import { ResponseEnvelopeDto } from "@/shared/dto/response-envelope.dto";
import { AuthService } from "./auth.service";
import type { SignInRequestDto } from "./dto/sign-in-request.dto";
import type { SignUpRequestDto } from "./dto/sign-up-request.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly envService: EnvService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post("sign-in")
    async signIn(
        @Body() request: SignInRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        this.attachAuthCookie(response, await this.service.signIn(request));

        return new ResponseEnvelopeDto("Autenticação realizada com sucesso.");
    }

    @HttpCode(HttpStatus.CREATED)
    @Post("sign-up")
    async signUp(
        @Body() request: SignUpRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ResponseEnvelopeDto> {
        this.attachAuthCookie(response, await this.service.signUp(request));

        return new ResponseEnvelopeDto("Cadastro realizado com sucesso.");
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
}
