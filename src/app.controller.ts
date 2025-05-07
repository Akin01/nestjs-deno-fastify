import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
} from "@nestjs/common";
import { AppService } from "./app.service.ts";
import { UserDto } from "./app.dto.ts";

@Controller("/users")
export class AppController {
	private logger = new Logger(AppController.name);

	constructor(private readonly appService: AppService) {}

	@Get()
	getUsers() {
		this.logger.log("get all users");
		return this.appService.getUsers();
	}

	@Get("/:id")
	getUserById(@Param("id") id: string) {
		this.logger.log(`get user by id: ${id}`);
		const userById = this.appService.getUserById(id);

		if (!userById) {
			throw new NotFoundException(`user with id ${id} not found`);
		}

		return userById;
	}

	@Post()
	insertUser(@Body() user: UserDto) {
		this.logger.log(`insert user: ${user.name}`);
		this.appService.insertUser({ ...user });
	}

	@Put("/:id")
	updateUser(@Param("id") id: string, @Body() user: UserDto) {
		this.logger.log(`update user by id: ${id}`);
		this.appService.updateUser(id, { ...user });
	}

	@Delete("/:id")
	deleteUser(@Param("id") id: string) {
		this.logger.log(`delete user by id: ${id}`);
		this.appService.deleteUser(id);
	}
}
