import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class UpdateEmailRequestDto {
    @ApiProperty({ example: "novoEmail@exemplo.com", description: "Novo e-mail do usuário" })
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly newEmail: string;

    @ApiProperty({ example: "senhaA@123", description: "Senha do usuário" })
    @IsPassword()
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
