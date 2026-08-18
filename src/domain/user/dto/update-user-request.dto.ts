import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

import { ToTitleCase } from "@/shared/decorators/to-title-case.decorator";
import { IsName } from "@/shared/validators/is-name.validator";

export class UpdateUserRequestDto {
    @ApiProperty({ example: "Usuário de Teste", description: "Nome do usuário" })
    @ToTitleCase()
    @IsName()
    @IsNotEmpty({ message: "O nome é obrigatório." })
    name: string;

    @ApiProperty({ example: "senhaA@123", description: "Senha do usuário" })
    @IsNotEmpty({ message: "A senha é obrigatória." })
    password: string;
}
