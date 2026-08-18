import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordRequestDto {
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly email: string;
}
