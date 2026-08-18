import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteUserRequestDto {
    @ApiProperty({ example: "senhaA@123", description: "Senha do usuário" })
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
