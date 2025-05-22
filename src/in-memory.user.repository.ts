import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { IUserRepository } from './user.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  async findAllUsers(page: number, limit: number): Promise<{ users: User[], total: number }> {
    const total = this.users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = this.users.slice(startIndex, endIndex);
    return { users: paginatedUsers, total };
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
    };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id);
  }
}
