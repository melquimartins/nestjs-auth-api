import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { EnvService } from "@/config/env/env-service";
import { UserController } from "./user.controller";
import { UserMapper } from "./user.mapper";
import { PrismaUserRepository, UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [EnvService],
            useFactory: (envService: EnvService) => ({
                secret: envService.getJwtSecret(),
                signOptions: { expiresIn: "30m" },
            }),
        }),
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserMapper,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
    exports: [UserRepository],
})
export class UserModule {}
