import { User } from '../../domain/user';

export interface UserRepositoryPort {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  save(user: Omit<User, 'id'>): Promise<User>;
}