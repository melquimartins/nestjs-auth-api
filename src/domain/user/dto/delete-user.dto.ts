import { IsNotEmpty } from "class-validator";

export class DeleteUserDto {
    @IsNotEmpty({ message: "A senha é obrigatória." })
    readonly password: string;
}
