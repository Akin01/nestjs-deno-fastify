import { User } from './user.model';

export interface IUserRepository {
  createUser(user: Omit<User, 'id'>): Promise<User>;
  findAllUsers(page: number, limit: number): Promise<{ users: User[], total: number }>;
  findUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
}
