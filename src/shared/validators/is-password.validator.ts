import { applyDecorators } from "@nestjs/common";
import { IsNotEmpty, Length, Matches } from "class-validator";

export function IsPassword() {
    return applyDecorators(
        IsNotEmpty({ message: "A senha é obrigatória." }),
        Length(8, 64, { message: "A senha deve ter entre 8 e 64 caracteres." }),
        Matches(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." }),
        Matches(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula." }),
        Matches(/[0-9]/, { message: "A senha deve conter pelo menos um número." }),
        Matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
            message: "A senha deve conter pelo menos um caractere especial.",
        }),
    );
}
