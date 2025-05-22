import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { IUserRepository } from './user.repository.interface';
import { v4 as uuidv4 } from 'uuid';

// Ensure Deno KV is available. This might be a global variable in Deno environment.
// deno-lint-ignore no-explicit-any
declare const Deno: any;

const kv = await Deno.openKv(); // Top-level await for Deno KV

@Injectable()
export class DenoKvUserRepository implements IUserRepository {
  private readonly userPrefix = ["users"];

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const userId = uuidv4();
    const newUser: User = {
      id: userId,
      ...userData,
    };
    await kv.set([...this.userPrefix, userId], newUser);
    return newUser;
  }

  async findAllUsers(page: number, limit: number): Promise<{ users: User[], total: number }> {
    const allUsers: User[] = [];
    const iter = kv.list<User>({ prefix: this.userPrefix });
    for await (const entry of iter) {
      if (entry.value) {
        allUsers.push(entry.value);
      }
    }

    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return { users: paginatedUsers, total };
  }

  async findUserById(id: string): Promise<User | undefined> {
    const result = await kv.get<User>([...this.userPrefix, id]);
    return result.value ?? undefined;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const existingUser = await this.findUserById(id);
    if (!existingUser) {
      return undefined;
    }
    const updatedUser: User = {
      ...existingUser,
      ...userData,
    };
    await kv.set([...this.userPrefix, id], updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await kv.delete([...this.userPrefix, id]);
  }
}
