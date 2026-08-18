import { ApiProperty } from "@nestjs/swagger";

export class ResponseEnvelopeDto<T = unknown> {
    @ApiProperty({ example: "Operação realizada com sucesso.", description: "Mensagem descritiva da resposta da API" })
    readonly message: string;

    @ApiProperty({ required: false, description: "Dados adicionais retornados pela operação" })
    readonly data?: T;

    constructor(message: string, data?: T) {
        this.message = message;
        this.data = data;
    }
}
