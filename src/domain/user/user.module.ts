import { Module } from "@nestjs/common";

import { UserController } from "./user.controller";
import { UserMapper } from "./user.mapper";
import { PrismaUserRepository, UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
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
