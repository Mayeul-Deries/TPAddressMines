import { User } from '../domain/user';
import { UserRepositoryPort } from '../ports/driven/repoPort';
import { UserPort } from '../ports/driving/userPort';

export class UserService implements UserPort {
  constructor(private repos: UserRepositoryPort[]) {}

  async listUsers(): Promise<User[]> {
    let allUsers: User[] = [];
    for (let repo of this.repos) {
      const users = await repo.findAll();
      allUsers = allUsers.concat(users);
    }
    return allUsers;
  }

  async getUser(id: string): Promise<User | null> {
    for (let repo of this.repos) {
      const user = await repo.findById(id);
      if (user) return user;
    }
    return null;
  }

  async createUser(input: Omit<User, 'id'>): Promise<User> {
    // Business rules could be applied here
    if (this.repos.length === 0) {
      throw new Error('No repository available to save user');
    }
    return this.repos[0].save(input);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    // Validate updates
    if (updates.height !== undefined && updates.height <= 0) {
      throw new Error('Height must be positive');
    }
    if (updates.weight !== undefined && updates.weight <= 0) {
      throw new Error('Weight must be positive');
    }
    if (updates.age !== undefined && updates.age < 0) {
      throw new Error('Age cannot be negative');
    }

    // Check if email is already taken by another user
    if (updates.email) {
      const allUsers = await this.listUsers();
      const emailExists = allUsers.some(u => u.email === updates.email && u.id !== id);
      if (emailExists) {
        throw new Error('Email already taken');
      }
    }

    // Update in the first repository
    if (this.repos.length === 0) {
      throw new Error('No repository available');
    }
    return this.repos[0].update(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.repos.length === 0) {
      throw new Error('No repository available');
    }
    return this.repos[0].delete(id);
  }

  async getUserStats(id: string): Promise<{
    imc: number;
    total_duration_min: number;
    weekly_calories: number;
  }> {
    const user = await this.repos[0].findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Calcul de l'IMC (Indice de Masse Corporelle)
    const heightInMeters = user.height / 100;
    const imc = user.weight / (heightInMeters * heightInMeters);

    const total_duration_min = 0;
    const weekly_calories = 0;

    return {
      imc: Math.round(imc * 100) / 100,
      total_duration_min,
      weekly_calories,
    };
  }
}
