import { Injectable } from "@nestjs/common";

import type { User } from "generated/prisma/client";

@Injectable()
export class UserService {
    async get(user: User): Promise<User> {
        return user;
    }
}
