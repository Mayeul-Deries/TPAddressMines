import { Activity } from '../../domain/activity';
import { User } from '../../domain/user';

export interface UserRepositoryPort {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  save(user: Omit<User, 'id'>): Promise<User>;
}

export interface ActivityRepositoryPort {
  findAll(): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  save(activity: Omit<Activity, 'id'>): Promise<Activity>;
}