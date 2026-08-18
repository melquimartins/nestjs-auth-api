import { IsNotEmpty } from "class-validator";

export class DeleteUserRequestDto {
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
