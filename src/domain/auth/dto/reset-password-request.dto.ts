import { IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class ResetPasswordRequestDto {
    @IsPassword()
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
