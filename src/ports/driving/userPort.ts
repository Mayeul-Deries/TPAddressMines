import { User } from '../../domain/user';

export interface UserPort {
  listAddresses(): Promise<User[]>;
  getAddress(id: string): Promise<User | null>;
  createAddress(input: Omit<User, 'id'>): Promise<User>;
}