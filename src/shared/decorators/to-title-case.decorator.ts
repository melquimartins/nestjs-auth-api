import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";

export function ToTitleCase() {
    return applyDecorators(
        Transform(({ value }: { value: string }) => {
            if (typeof value !== "string") {
                return value;
            }

            const prepositions = new Set(["de", "do", "da", "dos", "das"]);

            const words = value.trim().split(/\s+/);

            return words
                .map((word) => {
                    const lowerWord = word.toLowerCase();

                    if (prepositions.has(lowerWord)) {
                        return lowerWord;
                    }

                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(" ");
        }),
    );
}
