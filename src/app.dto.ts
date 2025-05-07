import { IsInt, IsString, Max, Min } from "class-validator";

export class UserDto {
	@IsString({ message: "name must be a string" })
	name: string;

	@IsInt({ message: "age must be a number" })
	@Min(2, { message: "age must be greater than 2" })
	@Max(100, { message: "age must be less than 100" })
	age: number;
}
