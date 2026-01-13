import { User } from '../../domain/user';
import { UserRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';

const store: User[] = [];

export class InMemoryUserRepo implements UserRepositoryPort {
    
  constructor(private readonly store: User[] = []) {}
    
  async findAll(): Promise<User[]> {
    return this.store.slice();
  }

  async findById(id: string): Promise<User | null> {
    const found = this.store.find(s => s.id === id);
    return found ?? null;
  }

  async save(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { id: uuidv4(), ...user };
    this.store.push(newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = store.findIndex(u => u.id === id);
    if (index === -1) {
      return null;
    }
    Object.assign(store[index], updates);
    return store[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = store.findIndex(u => u.id === id);
    if (index === -1) {
      return false;
    }
    store.splice(index, 1);
    return true;
  }
}
