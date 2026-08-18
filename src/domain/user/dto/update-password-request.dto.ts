import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

import { IsPassword } from "@/shared/validators/is-password.validator";

export class UpdatePasswordRequestDto {
    @ApiProperty({ example: "senhaA@123", description: "Senha atual do usuário" })
    @IsPassword()
    @IsNotEmpty({ message: "A senha atual é obrigatória." })
    readonly currentPassword: string;

    @ApiProperty({ example: "novaSenhaA@123", description: "Nova senha" })
    @IsPassword()
    @IsNotEmpty({ message: "A nova senha é obrigatória." })
    readonly newPassword: string;
}
