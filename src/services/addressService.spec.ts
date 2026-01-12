import { AddressService } from './addressService';
import { Address } from '../domain/address';

describe('AddressService', () => {
  let mockRepo: {
    findAll: jest.Mock<Promise<Address[]>, []>;
    findById: jest.Mock<Promise<Address | null>, [string]>;
    save: jest.Mock<Promise<Address>, [Omit<Address, 'id'>]>;
  };
  let service: AddressService;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };
    service = new AddressService(mockRepo as any);
  });

  it('listAddresses retourne la liste fournie par le repo', async () => {
    const sample: Address[] = [{ id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as Address];
    mockRepo.findAll.mockResolvedValue(sample);
    await expect(service.listAddresses()).resolves.toEqual(sample);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('getAddress retourne l\'adresse quand elle existe', async () => {
    const addr: Address = { id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as Address;
    mockRepo.findById.mockResolvedValue(addr);
    await expect(service.getAddress('1')).resolves.toEqual(addr);
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });

  it('getAddress retourne null quand l\'adresse est introuvable', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getAddress('missing')).resolves.toBeNull();
    expect(mockRepo.findById).toHaveBeenCalledWith('missing');
  });

  it('createAddress appelle save et retourne l\'adresse créée', async () => {
    const input: Omit<Address, 'id'> = { street: 'New', city: 'City', country: 'Land' } as unknown as Omit<Address, 'id'>;
    const saved: Address = { id: '2', ...input } as unknown as Address;
    mockRepo.save.mockResolvedValue(saved);
    await expect(service.createAddress(input)).resolves.toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(input);
  });
});

