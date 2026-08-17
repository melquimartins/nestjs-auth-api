import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { SignInRequestDto } from "./dto/sign-in-request.dto";
import { SignUpRequestDto } from "./dto/sign-up-request.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @Post("sign-in")
    async signIn(@Body() request: SignInRequestDto) {
        return this.service.signIn(request);
    }

    @Post("sign-up")
    async signUp(@Body() request: SignUpRequestDto) {
        return this.service.signUp(request);
    }
}
