import { IsNotEmpty } from "class-validator";

import { ToTitleCase } from "@/shared/decorators/to-title-case.decorator";
import { IsName } from "@/shared/validators/is-name.validator";

export class UpdateUserRequestDto {
    @ToTitleCase()
    @IsName()
    @IsNotEmpty({ message: "O nome é obrigatório." })
    name: string;

    @IsNotEmpty({ message: "A senha é obrigatória." })
    password: string;
}
