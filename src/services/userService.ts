import { User } from '../domain/user';
import { UserRepositoryPort } from '../ports/driven/repoPort';
import { UserPort } from "../ports/driving/userPort";

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
}
