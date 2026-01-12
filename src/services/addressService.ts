import { User } from '../domain/user';
import { UserRepositoryPort } from '../ports/driven/repoPort';
import { UserPort } from "../ports/driving/userPort";

export class AddressService implements UserPort {
  constructor(private repos: UserRepositoryPort[]) {}

  async listAddresses(): Promise<User[]> {
      let allAddresses: User[] = [];
     for (let repo of this.repos) {
       const addresses = await repo.findAll();
       allAddresses.concat(addresses);
     }
     return allAddresses;
  }

  async getAddress(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async createAddress(input: Omit<User, 'id'>): Promise<User> {
    // Business rules could be applied here
    return this.repo.save(input);
  }
}
