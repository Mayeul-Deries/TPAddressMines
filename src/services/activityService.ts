import { Activity } from '../domain/activity';
import { ActivityRepositoryPort } from '../ports/driven/repoPort';
import { ActivityPort } from '../ports/driving/activityPort';

export class ActivityService implements ActivityPort {
  constructor(private repo: ActivityRepositoryPort) {}

  async listActivities(): Promise<Activity[]> {
    return this.repo.findAll();
  }

  async getActivity(id: string): Promise<Activity | null> {
    return this.repo.findById(id);
  }

  async createActivity(input: Omit<Activity, 'id'>): Promise<Activity> {
    // Business rules could be applied here
    return this.repo.save(input);
  }

  async putActivity(id: string, updates: Partial<Activity>): Promise<Activity | null> {
    return this.repo.update(id, updates);
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
