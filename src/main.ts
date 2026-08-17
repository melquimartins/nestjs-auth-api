import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { EnvService } from "./config/env/env-service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const envService = app.get(EnvService);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix("api");

    await app.listen(envService.getPort());
}
bootstrap();
