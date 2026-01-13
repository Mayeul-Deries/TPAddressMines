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

  it('listUsers retourne la liste fournie par le repo', async () => {
    const sample: User[] = [{ id: '1', firstName: 'John', lastName: 'Doe', age: 30, email: 'john.doe@example.com', height: 180, weight: 75, hobby: 'Running', country: 'USA', gender: 'male' } as unknown as User];
    mockRepo.findAll.mockResolvedValue(sample);
    await expect(service.listUsers()).resolves.toEqual(sample);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('getUser retourne l\'utilisateur quand il existe', async () => {
    const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
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
    const input = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
    const saved = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
    mockRepo.save.mockResolvedValue(saved);
    await expect(service.createUser(input)).resolves.toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(input);
  });
});

