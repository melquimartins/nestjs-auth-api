import { Injectable } from "@nestjs/common";
import { PrismaService } from "./db/prisma.service";

@Injectable()
export class AppService {
    constructor(private readonly prismaService: PrismaService) {}

    createUser(): { message: string } {
        this.prismaService.user.create({
            data: {
                name: "Nome do Usuário",
                email: "usuario@exemplo.com",
                password: "senha123",
            },
        });

        return { message: "Usuário criado com sucesso!" };
    }
}
