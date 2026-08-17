import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInRequestDto {
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly email: string;

    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
