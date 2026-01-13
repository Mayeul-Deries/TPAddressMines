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
}