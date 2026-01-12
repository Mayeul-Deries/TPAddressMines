import { Address } from '../../domain/address';
import { AddressRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryAddressRepo } from './inMemoryAddressRepo';

describe('inMemoryAddressRepo', () => {
  let repo: InMemoryAddressRepo;
  let addresses: Address[] = [];

  beforeEach(async () => {
    addresses = [];
    repo = new InMemoryAddressRepo(addresses);
  })

  it('should save an address', async () => {
    const addressData = new Address('123 Main St','Anytown',12345);
    const savedAddress = await repo.save(addressData);

    expect(savedAddress).toHaveProperty('id');
    expect(savedAddress.street).toBe(addressData.street);
    expect(addresses.length).toBe(1);
  });

  it('should get all addresses by duplicating variable', async () => {
    addresses = [new Address('123 Main St','Anytown',12345)];
    repo = new InMemoryAddressRepo(addresses);
    const allAddresses = await repo.findAll();

    expect(allAddresses).toEqual(addresses);
    expect(allAddresses).not.toBe(addresses); // Ensure it's a copy
  });
})
