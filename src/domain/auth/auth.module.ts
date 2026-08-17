import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { EnvService } from "../../config/env/env-service";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            inject: [EnvService],
            useFactory: (envService: EnvService) => ({
                secret: envService.getJwtSecret(),
                signOptions: { expiresIn: "1d" },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
