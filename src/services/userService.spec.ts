import { UserService } from './userService';
import { User } from '../domain/user';

describe('UserService', () => {
  let mockRepo: {
    findAll: jest.Mock<Promise<User[]>, []>;
    findById: jest.Mock<Promise<User | null>, [string]>;
    save: jest.Mock<Promise<User>, [Omit<User, 'id'>]>;
    update: jest.Mock<Promise<User | null>, [string, Partial<User>]>;
    delete: jest.Mock<Promise<boolean>, [string]>;
  };
  let mockActivityRepo: {
    findAll: jest.Mock<Promise<any[]>, []>;
  };
  let service: UserService;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockActivityRepo = {
      findAll: jest.fn(),
    };
    service = new UserService(mockRepo as any, mockActivityRepo as any);
  });

  it('listUsers retourne la liste fournie par le repo', async () => {
    const sample: User[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        email: 'john.doe@example.com',
        height: 180,
        weight: 75,
        hobby: 'Running',
        country: 'USA',
        gender: 'male',
      } as unknown as User,
    ];
    mockRepo.findAll.mockResolvedValue(sample);
    await expect(service.listUsers()).resolves.toEqual(sample);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it("getUser retourne l'utilisateur quand il existe", async () => {
    const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
    mockRepo.findById.mockResolvedValue(user);
    await expect(service.getUser('1')).resolves.toEqual(user);
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });

  it("getUser retourne null quand l'utilisateur est introuvable", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getUser('missing')).resolves.toBeNull();
    expect(mockRepo.findById).toHaveBeenCalledWith('missing');
  });

  it("createUser appelle save et retourne l'utilisateur créé", async () => {
    const input = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
    const saved = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', 'male');
    mockRepo.save.mockResolvedValue(saved);
    await expect(service.createUser(input)).resolves.toEqual(saved);
    expect(mockRepo.save).toHaveBeenCalledWith(input);
  });

  it('updateUser met à jour un utilisateur existant', async () => {
    const existingUser = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
    const updates = { age: 31, weight: 76 };
    const updatedUser = { ...existingUser, ...updates };

    mockRepo.findById.mockResolvedValue(existingUser);
    mockRepo.findAll.mockResolvedValue([existingUser]);
    mockRepo.update.mockResolvedValue(updatedUser as User);

    await expect(service.updateUser('1', updates)).resolves.toEqual(updatedUser);
    expect(mockRepo.update).toHaveBeenCalledWith('1', updates);
  });

  it('lance une erreur si height est négatif ou zéro', async () => {
    const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
    mockRepo.findById.mockResolvedValue(user);

    await expect(service.updateUser('1', { height: -10 })).rejects.toThrow('Height must be positive');
    await expect(service.updateUser('1', { height: 0 })).rejects.toThrow('Height must be positive');
  });

  it('lance une erreur si weight est négatif ou zéro', async () => {
    const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
    mockRepo.findById.mockResolvedValue(user);

    await expect(service.updateUser('1', { weight: -5 })).rejects.toThrow('Weight must be positive');
  });

  it('lance une erreur si age est négatif ou zéro', async () => {
    const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
    mockRepo.findById.mockResolvedValue(user);

    await expect(service.updateUser('1', { age: -1 })).rejects.toThrow('Age cannot be negative');
  });

  it("lance une erreur si l'email est déjà pris par un autre utilisateur", async () => {
    const user1 = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
    const user2 = new User('Jane', 'Smith', 28, 'jane.smith@example.com', 165, 60, 'Swimming', 'USA', '2', 'female');

    mockRepo.findById.mockResolvedValue(user1);
    mockRepo.findAll.mockResolvedValue([user1, user2]);

    await expect(service.updateUser('1', { email: 'jane.smith@example.com' })).rejects.toThrow('Email already taken');
  });

  it('supprime un utilisateur existant', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await expect(service.deleteUser('1')).resolves.toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });

  it("retourne false si l'utilisateur n'existe pas", async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(service.deleteUser('missing')).resolves.toBe(false);
  });

  describe('getUserStats', () => {
    it('calcule les statistiques correctement pour un utilisateur homme', async () => {
      const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
      const activities = [
        {
          id: '1',
          userId: '1',
          type: 'Running',
          duration: 60,
          calories: 500,
          timestamp: new Date(),
          startTime: '10:00',
        },
        {
          id: '2',
          userId: '1',
          type: 'Running',
          duration: 45,
          calories: 400,
          timestamp: new Date(),
          startTime: '11:00',
        },
      ];

      mockRepo.findById.mockResolvedValue(user);
      mockActivityRepo.findAll.mockResolvedValue(activities);

      const stats = await service.getUserStats('1');

      expect(stats.imc).toBeCloseTo(23.15, 1);
      expect(stats.volume_hebdomadaire_heures).toBeCloseTo(1.75, 2);
      expect(stats.frequence_entrainement_semaine).toBe(2);
      expect(stats.total_duration_min).toBe(105);
      expect(stats.weekly_calories).toBe(900);
      expect(stats.moyenne_calories_seance).toBe(450);
      expect(stats.metabolisme_base).toBeGreaterThan(1700);
      expect(stats.poids_ideal).toBeCloseTo(72.5, 1);
    });

    it('calcule les statistiques correctement pour une utilisatrice femme', async () => {
      const user = new User('Jane', 'Smith', 28, 'jane.smith@example.com', 165, 60, 'Swimming', 'USA', '2', 'female');

      mockRepo.findById.mockResolvedValue(user);
      mockActivityRepo.findAll.mockResolvedValue([]);

      const stats = await service.getUserStats('2');

      expect(stats.imc).toBeCloseTo(22.04, 1);
      expect(stats.volume_hebdomadaire_heures).toBe(0);
      expect(stats.frequence_entrainement_semaine).toBe(0);
      expect(stats.moyenne_calories_seance).toBe(0);
      expect(stats.metabolisme_base).toBeGreaterThan(1300);
      expect(stats.poids_ideal).toBeCloseTo(59, 0);
    });

    it("lance une erreur si l'utilisateur n'existe pas", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getUserStats('missing')).rejects.toThrow('User not found');
    });

    it("filtre uniquement les activités de l'utilisateur", async () => {
      const user = new User('John', 'Doe', 30, 'john.doe@example.com', 180, 75, 'Running', 'USA', '1', 'male');
      const activities = [
        {
          id: '1',
          userId: '1',
          type: 'Running',
          duration: 60,
          calories: 500,
          timestamp: new Date(),
          startTime: '10:00',
        },
        {
          id: '2',
          userId: '2',
          type: 'Swimming',
          duration: 45,
          calories: 400,
          timestamp: new Date(),
          startTime: '11:00',
        },
      ];

      mockRepo.findById.mockResolvedValue(user);
      mockActivityRepo.findAll.mockResolvedValue(activities);

      const stats = await service.getUserStats('1');

      expect(stats.total_duration_min).toBe(60);
      expect(stats.weekly_calories).toBe(500);
    });
  });
});
