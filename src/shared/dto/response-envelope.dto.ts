export class ResponseEnvelopeDto<T = unknown> {
    readonly message: string;
    readonly data: T;

    constructor(message: string, data: T) {
        this.message = message;
        this.data = data;
    }
}
