import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

import { ToTitleCase } from "@/shared/decorators/to-title-case.decorator";
import { IsName } from "@/shared/validators/is-name.validator";
import { IsPassword } from "@/shared/validators/is-password.validator";

export class SignUpRequestDto {
    @ApiProperty({ example: "Usuário de Teste", description: "Nome do usuário" })
    @ToTitleCase()
    @IsName()
    @IsNotEmpty({ message: "O nome é obrigatório." })
    readonly name: string;

    @ApiProperty({ example: "usuario@exemplo.com", description: "E-mail do usuário" })
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly email: string;

    @IsPassword()
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
