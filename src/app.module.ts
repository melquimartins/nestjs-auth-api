import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EnvModule } from "./config/env/env.module";
import { envSchema } from "./config/env/env-schema";
import { EnvService } from "./config/env/env-service";
import { PrismaModule } from "./db/prisma.module";
import { UserModule } from "./domain/user/user.module";
import { JwtStrategy } from "./security/jwt-strategy";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        PassportModule,
        JwtModule.registerAsync({
            useFactory: (envService: EnvService) => ({
                global: true,
                secret: envService.getJwtSecret(),
                signOptions: { expiresIn: "1d" },
            }),
        }),
        EnvModule,
        UserModule,
        PrismaModule,
    ],
    providers: [JwtStrategy],
})
export class AppModule {}
