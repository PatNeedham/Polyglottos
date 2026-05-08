import { NewUser, User } from '../../types/models';
import { UserRepository } from '../types';

export class InMemoryUserRepository implements UserRepository {
  private store = new Map<string, User>();
  private counter = 0;

  async list(): Promise<User[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async create(input: NewUser): Promise<User> {
    const id = `mem-user-${++this.counter}`;
    const user: User = {
      id,
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.store.set(id, user);
    return user;
  }
}
