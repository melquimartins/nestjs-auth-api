import { Injectable } from "@nestjs/common";
import type { User } from "generated/prisma/client";
import type { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UserMapper {
    async toResponse(user: User): Promise<UserResponseDto> {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async toResponseList(users: User[]): Promise<UserResponseDto[]> {
        return Promise.all(users.map((user) => this.toResponse(user)));
    }
}
