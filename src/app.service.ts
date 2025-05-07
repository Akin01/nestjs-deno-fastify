import { Injectable } from "@nestjs/common";
import { UserDto } from "./app.dto.ts";

export type User = {
	id: string;
	name: string;
	age: number;
};

@Injectable()
export class AppService {
	data: User[] = [];

	getUsers(): User[] {
		return this.data;
	}

	getUserById(id: string): User | undefined {
		return this.data.find((u) => u.id === id);
	}

	insertUser(user: Omit<User, "id">) {
		this.data.push({
			id: crypto.randomUUID(),
			...user,
		});
	}

	updateUser(id: string, user: Omit<UserDto, "id">) {
		const dataIndex = this.data.findIndex((u) => u.id === id);
		this.data[dataIndex] = {
			id,
			...user,
		};
	}

	deleteUser(id: string) {
		this.data = this.data.filter((u) => u.id !== id);
	}
}
