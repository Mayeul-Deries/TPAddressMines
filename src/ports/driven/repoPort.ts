import { User } from '../../domain/user';

export interface UserRepositoryPort {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  save(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
