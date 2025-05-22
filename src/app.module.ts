import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// import { InMemoryUserRepository } from './in-memory.user.repository'; // Commented out
import { DenoKvUserRepository } from './deno-kv.user.repository';
import { IUserRepository } from './user.repository.interface';

@Module({
	imports: [ConfigModule.forRoot({
		isGlobal: true,
		envFilePath: [".env"],
	})],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: 'IUserRepository', // Using string token
			useClass: DenoKvUserRepository, // Changed to DenoKvUserRepository
		},
	],
})
export class AppModule {}
