import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EnvService {
    constructor(private readonly configService: ConfigService) {}

    getDatabaseUrl(): string {
        return this.configService.getOrThrow<string>("DATABASE_URL");
    }

    getJwtSecret(): string {
        return this.configService.getOrThrow<string>("JWT_SECRET");
    }

    getPort(): number {
        return this.configService.getOrThrow<number>("PORT");
    }
}
