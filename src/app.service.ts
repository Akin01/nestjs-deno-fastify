import { Inject, Injectable } from "@nestjs/common";
import { User } from './user.model';
import { IUserRepository } from './user.repository.interface';
import { UserDto } from "./app.dto"; // Assuming UserDto might be different from User model

@Injectable()
export class AppService {
import { PaginatedResponse } from "./pagination.dto";

@Injectable()
export class AppService {
	constructor(
		@Inject('IUserRepository') private readonly userRepository: IUserRepository,
	) {}

	async getUsers(page: number, limit: number): Promise<PaginatedResponse<User>> {
		const { users, total } = await this.userRepository.findAllUsers(page, limit);
		const totalPages = Math.ceil(total / limit);
		return {
			data: users,
			total,
			page,
			limit,
			totalPages,
		};
	}

	async getUserById(id: string): Promise<User | undefined> {
		return this.userRepository.findUserById(id);
	}

	async insertUser(userDto: Omit<UserDto, "id">): Promise<User> {
    // UserDto ({name, age}) is now aligned with Omit<User, 'id'> ({name, age})
		return this.userRepository.createUser(userDto as Omit<User, 'id'>);
	}

	async updateUser(id: string, userDto: Partial<Omit<UserDto, "id">>): Promise<User | undefined> {
    // UserDto ({name, age}) is now aligned with Partial<Omit<User, 'id'>> ({name?, age?})
		return this.userRepository.updateUser(id, userDto as Partial<Omit<User, 'id'>>);
	}

	async deleteUser(id: string): Promise<void> {
		return this.userRepository.deleteUser(id);
	}
}
