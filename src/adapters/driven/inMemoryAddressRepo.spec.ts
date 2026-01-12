// import { Address } from '../../domain/address';
// import { AddressRepositoryPort } from '../../ports/driven/repoPort';
// import { v4 as uuidv4 } from 'uuid';
// import { InMemoryAddressRepo } from './inMemoryAddressRepo';
//
// const store: Address[] = [];
//
// export class InMemoryAddressRepo implements AddressRepositoryPort {
//   async findAll(): Promise<Address[]> {
//     return store.slice();
//   }
//
//   async findById(id: string): Promise<Address | null> {
//     const found = store.find((s) => s.id === id);
//     return found ?? null;
//   }
//
//   async save(address: Omit<Address, 'id'>): Promise<Address> {
//     const newAddress: Address = { id: uuidv4(), ...address };
//     store.push(newAddress);
//     return newAddress;
//   }
// }
