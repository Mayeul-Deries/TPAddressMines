import { User } from '../domain/user';
import { Activity } from '../domain/activity';
import { UserRepositoryPort, ActivityRepositoryPort } from '../ports/driven/repoPort';
import { UserPort } from '../ports/driving/userPort';

export class UserService implements UserPort {
  constructor(private repos: UserRepositoryPort[], private activityRepo?: ActivityRepositoryPort) {}

  async listUsers(): Promise<User[]> {
    let allUsers: User[] = [];
    for (let repo of this.repos) {
      const users = await repo.findAll();
      allUsers = allUsers.concat(users);
    }
    return allUsers;
  }

  async getUser(id: string): Promise<User | null> {
    for (let repo of this.repos) {
      const user = await repo.findById(id);
      if (user) return user;
    }
    return null;
  }

  async createUser(input: Omit<User, 'id'>): Promise<User> {
    // Business rules could be applied here
    if (this.repos.length === 0) {
      throw new Error('No repository available to save user');
    }
    return this.repos[0].save(input);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    // Validate updates
    if (updates.height !== undefined && updates.height <= 0) {
      throw new Error('Height must be positive');
    }
    if (updates.weight !== undefined && updates.weight <= 0) {
      throw new Error('Weight must be positive');
    }
    if (updates.age !== undefined && updates.age < 0) {
      throw new Error('Age cannot be negative');
    }

    // Check if email is already taken by another user
    if (updates.email) {
      const allUsers = await this.listUsers();
      const emailExists = allUsers.some(u => u.email === updates.email && u.id !== id);
      if (emailExists) {
        throw new Error('Email already taken');
      }
    }

    // Update in the first repository
    if (this.repos.length === 0) {
      throw new Error('No repository available');
    }
    return this.repos[0].update(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.repos.length === 0) {
      throw new Error('No repository available');
    }
    return this.repos[0].delete(id);
  }

  async getUserStats(id: string): Promise<{
    imc: number;
    volume_hebdomadaire_heures: number;
    frequence_entrainement_semaine: number;
    metabolisme_base: number;
    poids_ideal: number;
    moyenne_calories_seance: number;
    total_duration_min: number;
    weekly_calories: number;
  }> {
    const user = await this.repos[0].findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Calcul de l'IMC (Indice de Masse Corporelle)
    const heightInMeters = user.height / 100;
    const imc = user.weight / (heightInMeters * heightInMeters);

    // Récupérer les activités de l'utilisateur
    let activities: Activity[] = [];
    if (this.activityRepo) {
      const allActivities = await this.activityRepo.findAll();
      activities = allActivities.filter(a => a.userId === id);
    }

    // Calculer les statistiques sur les 7 derniers jours
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = activities.filter(a => new Date(a.timestamp) >= sevenDaysAgo);

    // Volume hebdomadaire (en heures)
    const total_duration_min = weeklyActivities.reduce((sum, a) => sum + a.duration, 0);
    const volume_hebdomadaire_heures = Math.round((total_duration_min / 60) * 100) / 100;

    // Fréquence d'entraînement (nombre de séances par semaine)
    const frequence_entrainement_semaine = weeklyActivities.length;

    // Calories hebdomadaires
    const weekly_calories = weeklyActivities.reduce((sum, a) => sum + a.calories, 0);

    // Moyenne de calories par séance
    const moyenne_calories_seance =
      frequence_entrainement_semaine > 0 ? Math.round(weekly_calories / frequence_entrainement_semaine) : 0;

    // Métabolisme de base (formule de Harris-Benedict révisée)
    // Hommes: MB = 88.362 + (13.397 × poids en kg) + (4.799 × taille en cm) - (5.677 × âge en années)
    // Femmes: MB = 447.593 + (9.247 × poids en kg) + (3.098 × taille en cm) - (4.330 × âge en années)
    let metabolisme_base: number;
    if (user.gender === 'female') {
      metabolisme_base = 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.33 * user.age;
    } else {
      metabolisme_base = 88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * user.age;
    }
    metabolisme_base = Math.round(metabolisme_base);

    // Poids idéal (formule de Lorentz)
    // Hommes: Poids idéal = (Taille en cm - 100) - ((Taille en cm - 150) / 4)
    // Femmes: Poids idéal = (Taille en cm - 100) - ((Taille en cm - 150) / 2.5)
    let poids_ideal: number;
    if (user.gender === 'female') {
      poids_ideal = user.height - 100 - (user.height - 150) / 2.5;
    } else {
      poids_ideal = user.height - 100 - (user.height - 150) / 4;
    }
    poids_ideal = Math.round(poids_ideal * 100) / 100;

    return {
      imc: Math.round(imc * 100) / 100,
      volume_hebdomadaire_heures,
      frequence_entrainement_semaine,
      metabolisme_base,
      poids_ideal,
      moyenne_calories_seance,
      total_duration_min,
      weekly_calories,
    };
  }
}
