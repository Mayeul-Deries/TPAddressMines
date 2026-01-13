import { User } from '../../domain/user';
import { InMemoryUserRepo } from '../driven/inMemoryUserRepo';

describe('InMemoryUserRepo', () => {
  let repo: InMemoryUserRepo;
  let users: User[] = [];

  beforeEach(() => {
    users = [];
    repo = new InMemoryUserRepo(users);
  });

  it('should save a user', async () => {
    const userData = new User('Doe', 'John', 30, 'john.save@example.com', 180, 75, 'Running', 'FR', '10:00');
    const saved = await repo.save(userData as any);

    expect(saved).toHaveProperty('id');
    expect(saved.email).toBe(userData.email);
    expect(users.length).toBe(1);
  });

  it('should return a copy in findAll', async () => {
    users = [new User('Doe', 'Jane', 25, 'jane@example.com', 165, 60, 'Swimming', 'FR', '20:00')];
    repo = new InMemoryUserRepo(users);

    const all = await repo.findAll();
    expect(all).toEqual(users);
    expect(all).not.toBe(users);
  });

  it('should assign an id when saving without one', async () => {
    const userData = new User('Lee', 'Bruce', 40, 'bruce@example.com', 175, 80, 'Weightlifting', 'US');
    const saved = await repo.save(userData as any);

    expect(saved).toHaveProperty('id');
    expect(typeof saved.id).toBe('string');
    expect(users.length).toBe(1);
  });

  it('should find by id or return null', async () => {
    const u = new User('Find', 'Me', 31, 'findme@example.com', 170, 70, 'Running', 'FR', 'find-me');
    users = [u];
    repo = new InMemoryUserRepo(users);

    const found = await repo.findById('find-me');
    expect(found).not.toBeNull();
    expect(found).toEqual(u);

    const notFound = await repo.findById('nope');
    expect(notFound).toBeNull();
  });

  it('should update a user and mutate the store', async () => {
    const u = new User('Up', 'Date', 29, 'update@example.com', 160, 55, 'Running', 'FR', 'u1');
    users = [u];
    repo = new InMemoryUserRepo(users);

    const updated = await repo.update('u1', { height: 165, weight: 56 });
    expect(updated).not.toBeNull();
    expect(updated!.height).toBe(165);
    expect(users[0].height).toBe(165);
  });

  it('returns null when updating a non-existing user', async () => {
    users = [];
    repo = new InMemoryUserRepo(users);

    const updated = await repo.update('no-such-id', { height: 180 });
    expect(updated).toBeNull();
  });

  it('should delete a user by id and return boolean accordingly', async () => {
    const u = new User('Del', 'Ete', 22, 'del@example.com', 170, 65, 'Weightlifting', 'FR', 'd1');
    users = [u];
    repo = new InMemoryUserRepo(users);

    const deleted = await repo.delete('d1');
    expect(deleted).toBe(true);
    expect(users.length).toBe(0);

    const deleted2 = await repo.delete('nope');
    expect(deleted2).toBe(false);
  });
});
