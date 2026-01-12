import { UserService } from './userService';
import { User } from '../domain/user';

describe('UserService', () => {
  let mockRepo: {
    findAll: jest.Mock<Promise<User[]>, []>;
    findById: jest.Mock<Promise<User | null>, [string]>;
    save: jest.Mock<Promise<User>, [Omit<User, 'id'>]>;
  };
  let service: UserService;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };
    service = new UserService(mockRepo as any);
  });

  it('listAddresses retourne la liste fournie par le repo', async () => {
    const sample: User[] = [{ id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as User];
    mockRepo.findAll.mockResolvedValue(sample);
    await expect(service.listUsers()).resolves.toEqual(sample);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('getUser retourne l\'utilisateur quand il existe', async () => {
    const user: User = { id: '1', street: 'Main', city: 'Town', country: 'Country' } as unknown as User;
    mockRepo.findById.mockResolvedValue(user);
    await expect(service.getUser('1')).resolves.toEqual(user);
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });

  it('getUser retourne null quand l\'utilisateur est introuvable', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getUser('missing')).resolves.toBeNull();
    expect(mockRepo.findById).toHaveBeenCalledWith('missing');
  });

  it('createUser appelle save et retourne l\'utilisateur créé', async () => {
    const input: Omit<User, 'id'> = { street: 'New', city: 'City', country: 'Land' } as unknown as Omit<User, 'id'>;
    const saved: User = { id: '2', ...input } as unknown as User;
    mockRepo.save.mockResolvedValue(saved);
    await expect(service.createUser(input)).resolves.toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(input);
  });
});

