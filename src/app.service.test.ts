import {
  assertEquals,
  assertExists,
  assertStrictEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts"; // Using a specific version for stability
import { spy, stub, returnsNext } from "https://deno.land/std@0.224.0/testing/mock.ts";
import { AppService } from "./app.service.ts";
import { IUserRepository } from "./user.repository.interface.ts";
import { User } from "./user.model.ts";
import { UserDto } from "./app.dto.ts";
import { PaginatedResponse } from "./pagination.dto.ts"; // Import PaginatedResponse

// Mock Repository Setup
class MockUserRepository implements IUserRepository {
  createUser = stub(this, "createUser" as keyof this);
  // Explicitly type findAllUsers stub to match IUserRepository
  findAllUsers: sinon.SinonStub<[page: number, limit: number], Promise<{ users: User[]; total: number }>>;
  findUserById = stub(this, "findUserById" as keyof this);
  updateUser = stub(this, "updateUser" as keyof this);
  deleteUser = stub(this, "deleteUser" as keyof this);

  constructor() {
    // Initialize the stub for findAllUsers correctly
    this.findAllUsers = stub(this, "findAllUsers" as keyof this) as sinon.SinonStub<[page: number, limit: number], Promise<{ users: User[]; total: number }>>;
  }

  // Helper to reset stubs if needed, or use spy/stub features for call counts
  reset() {
    this.createUser.calls = [];
    this.findAllUsers.calls = []; // Reset calls for the stub
    this.findUserById.calls = [];
    this.updateUser.calls = [];
    this.deleteUser.calls = [];
  }
}

Deno.test("AppService - getUsers", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);

  const page = 1;
  const limit = 10;
  const testUsers: User[] = [{ id: "1", name: "User One", age: 30 }];
  const totalUsers = 1;

  // Mock the behavior for the updated findAllUsers
  mockRepo.findAllUsers.resolves({ users: testUsers, total: totalUsers });

  const result = await service.getUsers(page, limit);

  // Assertions for PaginatedResponse
  assertEquals(result.data, testUsers);
  assertEquals(result.total, totalUsers);
  assertEquals(result.page, page);
  assertEquals(result.limit, limit);
  assertEquals(result.totalPages, Math.ceil(totalUsers / limit));

  // Verify mockRepo.findAllUsers was called correctly
  assertEquals(mockRepo.findAllUsers.calls.length, 1);
  assertEquals(mockRepo.findAllUsers.calls[0].args, [page, limit]);
});

Deno.test("AppService - getUsers - empty result", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);

  const page = 1;
  const limit = 10;
  const testUsers: User[] = [];
  const totalUsers = 0;

  mockRepo.findAllUsers.resolves({ users: testUsers, total: totalUsers });

  const result = await service.getUsers(page, limit);

  assertEquals(result.data, testUsers);
  assertEquals(result.total, totalUsers);
  assertEquals(result.page, page);
  assertEquals(result.limit, limit);
  assertEquals(result.totalPages, 0); // Math.ceil(0 / 10) is 0

  assertEquals(mockRepo.findAllUsers.calls.length, 1);
  assertEquals(mockRepo.findAllUsers.calls[0].args, [page, limit]);
});


Deno.test("AppService - getUserById - found", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const testUser: User = { id: "1", name: "Test User", age: 25 };

  mockRepo.findUserById.resolves(testUser);

  const result = await service.getUserById("1");

  assertExists(result);
  assertEquals(result, testUser);
  assertEquals(mockRepo.findUserById.calls.length, 1);
  assertEquals(mockRepo.findUserById.calls[0].args[0], "1");
});

Deno.test("AppService - getUserById - not found", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);

  mockRepo.findUserById.resolves(undefined);

  const result = await service.getUserById("nonexistent");

  assertEquals(result, undefined);
  assertEquals(mockRepo.findUserById.calls.length, 1);
  assertEquals(mockRepo.findUserById.calls[0].args[0], "nonexistent");
});

Deno.test("AppService - insertUser", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const userDto: Omit<UserDto, "id"> = { name: "New User", age: 40 }; // UserDto is {name, age}
  const createdUser: User = { id: "newId", name: "New User", age: 40 };

  // The service casts userDto to Omit<User, 'id'>.
  // Our User model is {id, name, age}, so Omit<User, 'id'> is {name, age}.
  // UserDto is {name, age}. So they are compatible.
  mockRepo.createUser.resolves(createdUser);

  const result = await service.insertUser(userDto);

  assertEquals(result, createdUser);
  assertEquals(mockRepo.createUser.calls.length, 1);
  // AppService calls createUser with userDto, which is {name, age}
  // The mock expects Omit<User, 'id'> which is also {name, age}
  assertEquals(mockRepo.createUser.calls[0].args[0], userDto);
});

Deno.test("AppService - updateUser - found", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const userId = "1";
  const userDto: Partial<Omit<UserDto, "id">> = { name: "Updated User" }; // UserDto is {name, age}
  const updatedUser: User = { id: userId, name: "Updated User", age: 30 }; // Assuming original age was 30

  // The service casts userDto to Partial<Omit<User, 'id'>>.
  // User model is {id, name, age}, so Partial<Omit<User, 'id'>> is {name?, age?}.
  // UserDto is {name, age}, so Partial<Omit<UserDto, "id">> is {name?, age?}. Compatible.
  mockRepo.updateUser.resolves(updatedUser);

  const result = await service.updateUser(userId, userDto);

  assertEquals(result, updatedUser);
  assertEquals(mockRepo.updateUser.calls.length, 1);
  assertEquals(mockRepo.updateUser.calls[0].args[0], userId);
  assertEquals(mockRepo.updateUser.calls[0].args[1], userDto);
});

Deno.test("AppService - updateUser - not found", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const userId = "nonexistent";
  const userDto: Partial<Omit<UserDto, "id">> = { name: "Updated User" };

  mockRepo.updateUser.resolves(undefined);

  const result = await service.updateUser(userId, userDto);

  assertEquals(result, undefined);
  assertEquals(mockRepo.updateUser.calls.length, 1);
  assertEquals(mockRepo.updateUser.calls[0].args[0], userId);
  assertEquals(mockRepo.updateUser.calls[0].args[1], userDto);
});

Deno.test("AppService - deleteUser", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const userId = "1";

  mockRepo.deleteUser.resolves(Promise.resolve()); // deleteUser returns Promise<void>

  await service.deleteUser(userId);

  assertEquals(mockRepo.deleteUser.calls.length, 1);
  assertEquals(mockRepo.deleteUser.calls[0].args[0], userId);
});

// Example of how to test if the service re-throws an error from the repository
// This is not currently in AppService's design, but good to know.
/*
Deno.test("AppService - getUserById - repository throws", async () => {
  const mockRepo = new MockUserRepository();
  const service = new AppService(mockRepo);
  const errorMessage = "Database error";

  mockRepo.findUserById.rejects(new Error(errorMessage));

  await assertRejects(
    async () => {
      await service.getUserById("1");
    },
    Error,
    errorMessage
  );
  assertEquals(mockRepo.findUserById.calls.length, 1);
});
*/
