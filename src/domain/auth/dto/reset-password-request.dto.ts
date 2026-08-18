import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class ResetPasswordRequestDto {
    @ApiProperty({ example: "novaSenha@123", description: "Nova senha" })
    @IsPassword()
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
