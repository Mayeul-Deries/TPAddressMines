import { Activity } from '../../domain/activity';

export interface ActivityPort {
  listActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | null>;
  createActivity(input: Omit<Activity, 'id'>): Promise<Activity>;
  putActivity(id: string, updates: Partial<Activity>): Promise<Activity | null>;
  deleteActivity(id: string): Promise<boolean>;
}
