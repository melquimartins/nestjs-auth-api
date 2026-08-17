import { Injectable } from "@nestjs/common";

import type { User } from "generated/prisma/client";
import { PrismaService } from "@/db/prisma.service";

export abstract class UserRepository {
    abstract create(data: { email: string; password: string; name: string }): Promise<void>;

    abstract findByEmail(email: string): Promise<User | null>;

    abstract existsByEmail(email: string): Promise<boolean>;
}

@Injectable()
export class PrismaUserRepository extends PrismaService implements UserRepository {
    async create(data: { email: string; password: string; name: string }): Promise<void> {
        await this.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.user.findUnique({ where: { email } });
    }

    async existsByEmail(email: string): Promise<boolean> {
        return (await this.findByEmail(email)) !== null;
    }
}
