import { Address } from '../../domain/address';
import { AddressRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryAddressRepo implements AddressRepositoryPort {
  constructor(private readonly store: Address[] = []) {}

  async findAll(): Promise<Address[]> {
    return this.store.slice();
  }

  async findById(id: string): Promise<Address | null> {
    const found = this.store.find((s) => s.id === id);
    return found ?? null;
  }

  async save(address: Omit<Address, 'id'>): Promise<Address> {
    const newAddress: Address = { id: uuidv4(), ...address };
    this.store.push(newAddress);
    return newAddress;
  }
}
