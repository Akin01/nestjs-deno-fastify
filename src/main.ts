import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.ts";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
	const configService = new ConfigService();
	const port = configService.get<string>("PORT")!;

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	await app.listen(port, "0.0.0.0", () => {
		new Logger("main").log(`server is running on http://localhost:${port}`);
	});
}

bootstrap();
