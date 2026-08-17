import { IsEmail, IsNotEmpty } from "class-validator";

import { ToTitleCase } from "@/shared/decorators/to-title-case.decorator";
import { IsName } from "@/shared/validators/is-name.validator";
import { IsPassword } from "@/shared/validators/is-password.validator";

export class SignUpRequestDto {
    @ToTitleCase()
    @IsName()
    @IsNotEmpty({ message: "O nome é obrigatório." })
    readonly name: string;

    @IsEmail({}, { message: "O e-mail fornecido é inválido." })
    @IsNotEmpty({ message: "O e-mail é obrigatório." })
    readonly email: string;

    @IsPassword()
    readonly password: string;
}
