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
	Query,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { UserDto } from "./app.dto";
import { User } from "./user.model";
import { PaginationQueryDto, PaginatedResponse } from "./pagination.dto";

@Controller("/users")
export class AppController {
	private logger = new Logger(AppController.name);

	constructor(private readonly appService: AppService) {}

	@Get()
	async getUsers(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<User>> {
		this.logger.log(`Get all users with pagination: page=${paginationQuery.page}, limit=${paginationQuery.limit}`);
		// DTO provides default values for page and limit if they are not in the query
		return await this.appService.getUsers(paginationQuery.page!, paginationQuery.limit!);
	}

	@Get("/:id")
	async getUserById(@Param("id") id: string): Promise<User | undefined> {
		this.logger.log(`get user by id: ${id}`);
		const userById = await this.appService.getUserById(id);

		if (!userById) {
			throw new NotFoundException(`user with id ${id} not found`);
		}

		return userById;
	}

	@Post()
	async insertUser(@Body() userDto: UserDto): Promise<User> {
		this.logger.log(`insert user: ${userDto.name}`);
		// Assuming UserDto now aligns with {name: string, email: string}
		// or that AppService's insertUser correctly handles the mapping if UserDto is {name: string, age: number}
		return await this.appService.insertUser(userDto);
	}

	@Put("/:id")
	async updateUser(@Param("id") id: string, @Body() userDto: UserDto): Promise<User | undefined> {
		this.logger.log(`update user by id: ${id}`);
		return await this.appService.updateUser(id, userDto);
	}

	@Delete("/:id")
	async deleteUser(@Param("id") id: string): Promise<void> {
		this.logger.log(`delete user by id: ${id}`);
		await this.appService.deleteUser(id);
	}
}
