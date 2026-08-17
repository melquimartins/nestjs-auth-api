import { isNotEmpty, registerDecorator, ValidationOptions } from "class-validator";

export function IsName(options?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: "isName",
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value: string) {
                    if (!isNotEmpty(value)) {
                        return false;
                    }

                    const prepositions = new Set(["de", "do", "da", "dos", "das"]);

                    const words = value
                        .trim()
                        .split(/\s+/)
                        .filter((word) => !prepositions.has(word.toLowerCase()));

                    return words.length >= 2;
                },
                defaultMessage(): string {
                    return "O nome deve conter apenas nome e sobrenome.";
                },
            },
        });
    };
}
