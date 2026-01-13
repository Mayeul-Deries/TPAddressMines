import { UserService } from '../services/userService';
import { InMemoryUserRepo } from '../adapters/driven/inMemoryUserRepo';
import { InMemoryActivityRepo } from '../adapters/driven/inMemoryActivityRepo';
import { User } from '../domain/user';

describe('UserService - integration (real repos)', () => {
  let userRepo: InMemoryUserRepo;
  let activityRepo: InMemoryActivityRepo;
  let service: UserService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepo();
    activityRepo = new InMemoryActivityRepo();
    service = new UserService(userRepo as any, activityRepo as any);
  });

  it('creates and retrieves a user', async () => {
    const input = new User('John', 'Doe', 30, 'john.integration@example.com', 180, 75, 'Running', 'FR');
    const created = await service.createUser(input as any);
    expect(created).toHaveProperty('id');

    const fetched = await service.getUser(created.id!);
    expect(fetched).not.toBeNull();
    expect(fetched!.email).toBe(input.email);
  });

  it('updates a user and enforces business rules', async () => {
    const input = new User('Jane', 'Smith', 28, 'jane.integration@example.com', 165, 60, 'Swimming', 'FR');
    const created = await service.createUser(input as any);

    const updated = await service.updateUser(created.id!, { weight: 62 });
    console.log(updated);
    
    expect(updated).not.toBeNull();
    expect(updated!.weight).toBe(62);

    await expect(service.updateUser(created.id!, { height: 0 })).rejects.toThrow('Height must be positive');
  });

  it('calculates stats using activity repo', async () => {
    const user = new User('Jim', 'Beam', 35, 'jim@example.com', 175, 80, 'Running', 'FR');
    const created = await service.createUser(user as any);

    // add activities linked to this user
    await activityRepo.save({ id: 'a1', userId: created.id, type: 'Running', duration: 30, calories: 300, timestamp: new Date() } as any);
    await activityRepo.save({ id: 'a2', userId: created.id, type: 'Running', duration: 45, calories: 450, timestamp: new Date() } as any);

    const stats = await service.getUserStats(created.id!);
    expect(stats.total_duration_min).toBeGreaterThan(0);
    expect(stats.frequence_entrainement_semaine).toBeGreaterThan(0);
  });

  it('deletes a user', async () => {
    const u = new User('Del', 'Ette', 22, 'del@example.com', 170, 65, 'Weightlifting', 'FR');
    const created = await service.createUser(u as any);

    const deleted = await service.deleteUser(created.id!);
    expect(deleted).toBe(true);

    const fetched = await service.getUser(created.id!);
    expect(fetched).toBeNull();
  });
});
