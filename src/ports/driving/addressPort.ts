import { Address } from '../../domain/user';

export interface AddressPort {
  listAddresses(): Promise<Address[]>;
  getAddress(id: string): Promise<Address | null>;
  createAddress(input: Omit<Address, 'id'>): Promise<Address>;
}