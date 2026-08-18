import { IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class UpdatePasswordRequestDto {
    @IsPassword()
    @IsNotEmpty({ message: "A senha atual é obrigatória." })
    readonly currentPassword: string;

    @IsPassword()
    @IsNotEmpty({ message: "A nova senha é obrigatória." })
    readonly newPassword: string;
}
