import { Activity } from '../../domain/activity';
import { ActivityRepositoryPort } from '../../ports/driven/repoPort';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryActivityRepo implements ActivityRepositoryPort {

  constructor(private readonly store: Activity[] = []) {}

  async findAll(): Promise<Activity[]> {
    return this.store.slice();
  }

  async findById(id: string): Promise<Activity | null> {
    const found = this.store.find(a => a.id === id);
    return found ?? null;
  }

  async save(activity: any): Promise<Activity> {
    // If the passed object already has an id, keep it; otherwise assign one.
    if (!activity.id) {
      activity.id = uuidv4();
    }
    this.store.push(activity);
    return activity;
  }
}
