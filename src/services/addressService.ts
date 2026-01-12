import { Address } from '../domain/address';
import { AddressRepositoryPort } from '../ports/driven/repoPort';
import { AddressPort } from "../ports/driving/addressPort";

export class AddressService implements AddressPort {
  constructor(private repo: AddressRepositoryPort) {}

  async listAddresses(): Promise<Address[]> {
     return this.repo.findAll();
  }

  async getAddress(id: string): Promise<Address | null> {
    return this.repo.findById(id);
  }

  async createAddress(input: Omit<Address, 'id'>): Promise<Address> {
    // Business rules could be applied here
    return this.repo.save(input);
  }
}
