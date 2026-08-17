import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";

import { EnvModule } from "./config/env/env.module";
import { envSchema } from "./config/env/env-schema";
import { PrismaModule } from "./db/prisma.module";
import { AuthModule } from "./domain/auth/auth.module";
import { UserModule } from "./domain/user/user.module";
import { JwtStrategy } from "./security/jwt-strategy";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        EnvModule,
        PrismaModule,
        UserModule,
        AuthModule,
        PassportModule,
    ],
    providers: [JwtStrategy],
})
export class AppModule {}
