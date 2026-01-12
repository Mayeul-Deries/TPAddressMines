import { Address } from '../domain/user';
import { AddressRepositoryPort } from '../ports/driven/repoPort';
import { AddressPort } from "../ports/driving/addressPort";

export class AddressService implements AddressPort {
  constructor(private repos: AddressRepositoryPort[]) {}

  async listAddresses(): Promise<Address[]> {
      let allAddresses: Address[] = [];
     for (let repo of this.repos) {
       const addresses = await repo.findAll();
       allAddresses.concat(addresses);
     }
     return allAddresses;
  }

  async getAddress(id: string): Promise<Address | null> {
    return this.repo.findById(id);
  }

  async createAddress(input: Omit<Address, 'id'>): Promise<Address> {
    // Business rules could be applied here
    return this.repo.save(input);
  }
}
