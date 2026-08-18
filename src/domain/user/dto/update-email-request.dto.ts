import { IsEmail, IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class UpdateEmailRequestDto {
    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly newEmail: string;

    @IsPassword()
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
