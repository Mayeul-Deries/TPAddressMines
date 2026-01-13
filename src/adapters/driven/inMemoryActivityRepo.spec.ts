import { Activity } from '../../domain/activity';
import { ActivityRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryActivityRepo } from './inMemoryActivityRepo';

describe('inMemoryActivityRepo', () => {
  let repo: InMemoryActivityRepo;
  let activities: Activity[] = [];

  beforeEach(async () => {
    activities = [];
    repo = new InMemoryActivityRepo(activities);
  });

  it('should save an activity', async () => {
    const activityData = new Activity('1', 'Running', 30, 300, new Date(), '10:00');
    const savedActivity = await repo.save(activityData);

    expect(savedActivity).toHaveProperty('id');
    expect(savedActivity.type).toBe(activityData.type);

    expect(activities.length).toBe(1);
  });

  it('should get all activities by duplicating variable', async () => {
    activities = [new Activity('1', 'Running', 30, 300, new Date(), '10:00')];
    repo = new InMemoryActivityRepo(activities);
    const allActivities = await repo.findAll();
    expect(allActivities).toEqual(activities);
    expect(allActivities).not.toBe(activities);
  });

  it('should assign an id when saving an activity without one', async () => {
    activities = [];
    repo = new InMemoryActivityRepo(activities);
    const activityData = new Activity('1', 'Running', 45, 400, new Date());
    const savedActivity = await repo.save(activityData as any);

    expect(savedActivity).toHaveProperty('id');
    expect(typeof savedActivity.id).toBe('string');
    expect(activities.length).toBe(1);
  });

  it('should find an activity by id or return null when not found', async () => {
    const a = new Activity('1', 'Cycling', 60, 600, new Date(), 'find-me');
    activities = [a];
    repo = new InMemoryActivityRepo(activities);

    const found = await repo.findById('find-me');
    expect(found).not.toBeNull();
    expect(found).toEqual(a);

    const notFound = await repo.findById('nope');
    expect(notFound).toBeNull();
  });
});
