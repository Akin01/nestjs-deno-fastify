import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.ts";
import { AppService } from "./app.service.ts";

@Module({
	imports: [ConfigModule.forRoot({
		isGlobal: true,
		envFilePath: [".env"],
	})],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
