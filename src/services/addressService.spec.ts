import { AddressService } from './userService';
import { User } from '../domain/user';

describe('AddressService', () => {
  let mockRepo: {
    findAll: jest.Mock<Promise<User[]>, []>;
    findById: jest.Mock<Promise<User | null>, [string]>;
    save: jest.Mock<Promise<User>, [Omit<User, 'id'>]>;
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
    const sample: User[] = [{ id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as User];
    mockRepo.findAll.mockResolvedValue(sample);
    await expect(service.listAddresses()).resolves.toEqual(sample);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('getAddress retourne l\'adresse quand elle existe', async () => {
    const addr: User = { id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as User;
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
    const input: Omit<User, 'id'> = { street: 'New', city: 'City', country: 'Land' } as unknown as Omit<User, 'id'>;
    const saved: User = { id: '2', ...input } as unknown as User;
    mockRepo.save.mockResolvedValue(saved);
    await expect(service.createAddress(input)).resolves.toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(input);
  });
});

