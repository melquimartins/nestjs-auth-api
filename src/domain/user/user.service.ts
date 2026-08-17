import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import type { User } from "generated/prisma/client";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
    constructor(private readonly repository: UserRepository) {}

    async get(user: User): Promise<User> {
        return user;
    }

    async update(user: User, request: UpdateUserDto): Promise<User> {
        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("As credenciais informadas são inválidas.");
        }

        if (request.name === user.name) {
            return user;
        }

        return await this.repository.update(user.id, {
            name: request.name,
        });
    }

    async delete(user: User, request: DeleteUserDto): Promise<void> {
        if (!(await bcrypt.compare(request.password, user.password))) {
            throw new UnauthorizedException("As credenciais informadas são inválidas.");
        }

        await this.repository.delete(user.id);
    }
}
