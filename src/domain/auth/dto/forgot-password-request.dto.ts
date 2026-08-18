import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordRequestDto {
    @ApiProperty({ example: "usuario@exemplo.com", description: "E-mail do usuário" })
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly email: string;
}
