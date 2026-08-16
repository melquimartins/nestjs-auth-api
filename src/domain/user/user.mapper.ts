import { Injectable } from "@nestjs/common";
import type { User } from "generated/prisma/client";
import type { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UserMapper {
    async toResponse(user: User): Promise<UserResponseDto> {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async toResponseList(users: User[]): Promise<UserResponseDto[]> {
        return Promise.all(users.map((user) => this.toResponse(user)));
    }
}
