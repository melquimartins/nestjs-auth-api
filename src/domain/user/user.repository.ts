import { Injectable } from "@nestjs/common";

import type { User } from "generated/prisma/client";
import { PrismaService } from "@/db/prisma.service";

export abstract class UserRepository {
    abstract create(data: { email: string; password: string; name: string }): Promise<User>;

    abstract findById(id: number): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;

    abstract update(id: number, data: { email?: string; password?: string; name?: string }): Promise<User>;

    abstract delete(id: number): Promise<void>;

    abstract existsByEmail(email: string): Promise<boolean>;
}

@Injectable()
export class PrismaUserRepository extends PrismaService implements UserRepository {
    async create(data: { email: string; password: string; name: string }): Promise<User> {
        return await this.user.create({ data });
    }

    async findById(id: number): Promise<User | null> {
        return await this.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.user.findUnique({ where: { email } });
    }

    async update(id: number, data: { email?: string; password?: string; name?: string }): Promise<User> {
        return await this.user.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.user.delete({ where: { id } });
    }

    async existsByEmail(email: string): Promise<boolean> {
        return (await this.user.findUnique({ where: { email } })) !== null;
    }
}
