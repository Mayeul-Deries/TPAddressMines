import { Activity } from '../../domain/activity';
import { ActivityRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';

const activityStore: Activity[] = [];

export class InMemoryActivityRepo implements ActivityRepositoryPort {
  async findAll(): Promise<Activity[]> {
    return activityStore.slice();
  }

  async findById(id: string): Promise<Activity | null> {
    const found = activityStore.find(a => a.id === id);
    return found ?? null;
  }

  async save(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const newActivity: Activity = { id: uuidv4(), ...activity };
    activityStore.push(newActivity);
    return newActivity;
  }
}
