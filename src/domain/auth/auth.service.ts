import { Injectable } from "@nestjs/common";

import { SignInRequestDto } from "./dto/sign-in-request.dto";
import { SignUpRequestDto } from "./dto/sign-up-request.dto";

@Injectable()
export class AuthService {
    async signIn(request: SignInRequestDto) {
        return request;
    }

    async signUp(request: SignUpRequestDto) {
        return request;
    }
}
