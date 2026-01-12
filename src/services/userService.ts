import { User } from '../domain/user';
import { UserRepositoryPort } from '../ports/driven/repoPort';
import { UserPort } from "../ports/driving/userPort";

export class UserService implements UserPort {
  constructor(private repos: UserRepositoryPort[]) {}

  async listUsers(): Promise<User[]> {
      let allUsers: User[] = [];
     for (let repo of this.repos) {
       const users = await repo.findAll();
       allUsers.concat(users);
     }
     return allUsers;
  }

  async getUser(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async createUser(input: Omit<User, 'id'>): Promise<User> {
    // Business rules could be applied here
    return this.repo.save(input);
  }
}
