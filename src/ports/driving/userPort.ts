import { User } from '../../domain/user';

export interface UserPort {
  listUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(input: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  getUserStats?(id: string): Promise<{
    imc: number;
    volume_hebdomadaire_heures: number;
    frequence_entrainement_semaine: number;
    metabolisme_base: number;
    poids_ideal: number;
    moyenne_calories_seance: number;
    total_duration_min: number;
    weekly_calories: number;
  }>;
}
