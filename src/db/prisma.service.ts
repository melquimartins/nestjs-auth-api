import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import { Pool } from "pg";

import { EnvService } from "@/config/env/env-service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly pool: Pool;

    constructor(readonly envService: EnvService) {
        const connectionString = envService.getDatabaseUrl();
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        super({ adapter });
        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}
