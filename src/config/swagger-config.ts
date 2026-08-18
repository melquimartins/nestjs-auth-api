import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerConfig(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle("Auth API")
        .setDescription("Documentação da API de autenticação")
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document);
}
