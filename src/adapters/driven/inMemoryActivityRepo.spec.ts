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
  })

  it('should save an activity', async () => {
    const activityData = new Activity("1", 'Running', 30, 300, new Date(), '10:00');
    const savedActivity = await repo.save(activityData);

    expect(savedActivity).toHaveProperty('id');
    expect(savedActivity.type).toBe(activityData.type);
    console.log(savedActivity);
    
    expect(activities.length).toBe(1);
  });

  it('should get all activities by duplicating variable', async () => {
    activities = [new Activity("1", 'Running', 30, 300, new Date(), '10:00')];
    repo = new InMemoryActivityRepo(activities);
    const allActivities = await repo.findAll();
    expect(allActivities).toEqual(activities);
    expect(allActivities).not.toBe(activities); // Ensure it's a copy
  });
})
