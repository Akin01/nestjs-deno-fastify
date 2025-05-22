import {
  assertEquals,
  assertExists,
  assertThrows,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { stub, Spy, spy } from "https://deno.land/std@0.224.0/testing/mock.ts";
import { AppController } from "./app.controller.ts";
import { AppService } from "./app.service.ts";
import { UserDto } from "./app.dto.ts";
import { User } from "./user.model.ts";
import { IUserRepository } from "./user.repository.interface.ts";
import { NotFoundException } from "@nestjs/common";
import { PaginationQueryDto, PaginatedResponse } from "./pagination.dto.ts"; // Import pagination DTOs

// Minimal mock for IUserRepository for AppService construction
class MockUserRepository implements IUserRepository {
  createUser = stub(this, "createUser" as keyof this);
  // Explicitly type findAllUsers stub to match IUserRepository for AppService construction
  findAllUsers: sinon.SinonStub<[page: number, limit: number], Promise<{ users: User[]; total: number }>>;
  findUserById = stub(this, "findUserById" as keyof this);
  updateUser = stub(this, "updateUser" as keyof this);
  deleteUser = stub(this, "deleteUser" as keyof this);

  constructor() {
    this.findAllUsers = stub(this, "findAllUsers" as keyof this) as sinon.SinonStub<[page: number, limit: number], Promise<{ users: User[]; total: number }>>;
  }
}

Deno.test("AppController - getUsers", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository); // appService needs a repo with correct findAllUsers
  const controller = new AppController(appService);

  const page = 1;
  const limit = 5;
  const paginationQueryDto = new PaginationQueryDto(); // Use defaults or set specific
  paginationQueryDto.page = page;
  paginationQueryDto.limit = limit;

  const testUsers: User[] = [{ id: "1", name: "User One", age: 30 }];
  const totalUsers = 1;
  const expectedResponse: PaginatedResponse<User> = {
    data: testUsers,
    total: totalUsers,
    page,
    limit,
    totalPages: Math.ceil(totalUsers / limit),
  };

  // Stub appService.getUsers to expect page, limit and return PaginatedResponse<User>
  const getUsersStub = stub(appService, "getUsers", () => Promise.resolve(expectedResponse));

  try {
    const result = await controller.getUsers(paginationQueryDto);
    assertEquals(result, expectedResponse);
    assertEquals(getUsersStub.calls.length, 1);
    // Controller calls service with page and limit from DTO
    assertEquals(getUsersStub.calls[0].args, [page, limit]);
  } finally {
    getUsersStub.restore();
  }
});

Deno.test("AppController - getUsers - default pagination", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const paginationQueryDto = new PaginationQueryDto(); // Uses default page=1, limit=10

  const testUsers: User[] = [];
  const totalUsers = 0;
  const expectedResponse: PaginatedResponse<User> = {
    data: testUsers,
    total: totalUsers,
    page: paginationQueryDto.page!,
    limit: paginationQueryDto.limit!,
    totalPages: 0,
  };

  const getUsersStub = stub(appService, "getUsers", () => Promise.resolve(expectedResponse));

  try {
    const result = await controller.getUsers(paginationQueryDto);
    assertEquals(result, expectedResponse);
    assertEquals(getUsersStub.calls.length, 1);
    assertEquals(getUsersStub.calls[0].args, [paginationQueryDto.page!, paginationQueryDto.limit!]);
  } finally {
    getUsersStub.restore();
  }
});


Deno.test("AppController - getUserById - success", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const mockUser: User = { id: "1", name: "Test User", age: 30 };
  const getUserByIdStub = stub(appService, "getUserById", () => Promise.resolve(mockUser));

  try {
    const result = await controller.getUserById("1");
    assertExists(result);
    assertEquals(result.id, "1");
    assertEquals(result.name, "Test User");
    assertEquals(getUserByIdStub.calls.length, 1);
    assertEquals(getUserByIdStub.calls[0].args[0], "1");
  } finally {
    getUserByIdStub.restore();
  }
});

Deno.test("AppController - getUserById - not found", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const getUserByIdStub = stub(appService, "getUserById", () => Promise.resolve(undefined));

  try {
    await assertThrows(
      async () => {
        await controller.getUserById("2");
      },
      NotFoundException,
      "user with id 2 not found",
    );
    assertEquals(getUserByIdStub.calls.length, 1);
    assertEquals(getUserByIdStub.calls[0].args[0], "2");
  } finally {
    getUserByIdStub.restore();
  }
});

Deno.test("AppController - insertUser", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const userDto: UserDto = { name: "New User", age: 40 }; // UserDto is {name, age}
  const createdUser: User = { id: "newId", ...userDto };
  // Controller's insertUser returns the result of appService.insertUser
  const insertUserStub = stub(appService, "insertUser", () => Promise.resolve(createdUser));

  try {
    const result = await controller.insertUser(userDto);
    assertEquals(result, createdUser);
    assertEquals(insertUserStub.calls.length, 1);
    assertEquals(insertUserStub.calls[0].args[0], userDto);
  } finally {
    insertUserStub.restore();
  }
});

Deno.test("AppController - updateUser - success", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const userId = "1";
  const userDto: UserDto = { name: "Updated User", age: 31 };
  const updatedUserFromService: User = { id: userId, ...userDto };

  // Controller's updateUser calls appService.updateUser
  // and returns its result. If service returns undefined (user not found),
  // controller doesn't throw NotFoundException itself, it would return undefined.
  // The subtask asks to test that it calls appService.updateUser.
  // The NotFoundException for updateUser would typically be if getUserById was called first,
  // or if the service itself threw it.
  // For this test, we assume updateUser in service might return undefined if not found.
  const updateUserStub = stub(appService, "updateUser", () => Promise.resolve(updatedUserFromService));

  try {
    const result = await controller.updateUser(userId, userDto);
    assertEquals(result, updatedUserFromService);
    assertEquals(updateUserStub.calls.length, 1);
    assertEquals(updateUserStub.calls[0].args[0], userId);
    assertEquals(updateUserStub.calls[0].args[1], userDto);
  } finally {
    updateUserStub.restore();
  }
});

Deno.test("AppController - updateUser - service returns undefined (user not found by service)", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);

  const userId = "nonexistent";
  const userDto: UserDto = { name: "Updated User", age: 31 };

  const updateUserStub = stub(appService, "updateUser", () => Promise.resolve(undefined));

  try {
    const result = await controller.updateUser(userId, userDto);
    assertEquals(result, undefined); // Controller returns what service returns
    assertEquals(updateUserStub.calls.length, 1);
    assertEquals(updateUserStub.calls[0].args[0], userId);
  } finally {
    updateUserStub.restore();
  }
});


Deno.test("AppController - deleteUser", async () => {
  const mockUserRepository = new MockUserRepository();
  const appService = new AppService(mockUserRepository);
  const controller = new AppController(appService);
  const userId = "1";

  // Controller's deleteUser calls appService.deleteUser.
  // It doesn't currently check if user exists first or handle NotFoundException.
  // It has a void return type.
  const deleteUserSpy = spy(appService, "deleteUser"); // Using spy as it's void

  try {
    await controller.deleteUser(userId);
    assertEquals(deleteUserSpy.calls.length, 1);
    assertEquals(deleteUserSpy.calls[0].args[0], userId);
  } finally {
    deleteUserSpy.restore(); // Spies also need restoring if created with `stub` like behavior or on prototype
  }
});
