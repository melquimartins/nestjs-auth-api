import { Injectable } from "@nestjs/common";
import { User } from "generated/prisma/client";
import { PrismaService } from "../../db/prisma.service";

export abstract class UserRepository {
    abstract findByEmail(email: string): Promise<User | null>;
}

@Injectable()
export class PrismaUserRepository extends PrismaService implements UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return await this.user.findUnique({
            where: { email },
        });
    }
}
