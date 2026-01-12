import { User } from '../../domain/user';
import { UserRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';

const store: User[] = [];

export class InMemoryUserRepo implements UserRepositoryPort {
  async findAll(): Promise<User[]> {
    return store.slice();
  }

  async findById(id: string): Promise<User | null> {
    const found = store.find((s) => s.id === id);
    return found ?? null;
  }

  async save(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { id: uuidv4(), ...user };
    store.push(newUser);
    return newUser;
  }
}
