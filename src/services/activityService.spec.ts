import { ActivityService } from './activityService';
import { Activity } from '../domain/activity';

describe('ActivityService', () => {
  let mockRepo: {
    findAll: jest.Mock<Promise<Activity[]>, []>;
    findById: jest.Mock<Promise<Activity | null>, [string]>;
    save: jest.Mock<Promise<Activity>, [Activity]>;
    update: jest.Mock<Promise<Activity | null>, [string, Partial<Activity>]>;
    delete: jest.Mock<Promise<boolean>, [string]>;
  };
  let service: ActivityService;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new ActivityService(mockRepo as any);
  });

  describe('listActivities', () => {
    it('retourne la liste fournie par le repo', async () => {
      const sample: Activity[] = [
        new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'), 'activity1'),
        new Activity('user2', 'Swimming', 45, 400, new Date('2024-01-02'), 'activity2'),
      ];

      mockRepo.findAll.mockResolvedValue(sample);

      await expect(service.listActivities()).resolves.toEqual(sample);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it("retourne une liste vide quand aucune activité n'existe", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      await expect(service.listActivities()).resolves.toEqual([]);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActivity', () => {
    it("retourne l'activité quand elle existe", async () => {
      const activity = new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'), 'activity1');
      mockRepo.findById.mockResolvedValue(activity);

      await expect(service.getActivity('activity1')).resolves.toEqual(activity);
      expect(mockRepo.findById).toHaveBeenCalledWith('activity1');
    });

    it("retourne null quand l'activité est introuvable", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getActivity('missing')).resolves.toBeNull();
      expect(mockRepo.findById).toHaveBeenCalledWith('missing');
    });
  });

  describe('createActivity', () => {
    it("appelle save et retourne l'activité créée", async () => {
      const input = new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'));
      const saved = new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'), 'activity1');

      mockRepo.save.mockResolvedValue(saved);

      await expect(service.createActivity(input)).resolves.toEqual(saved);
      expect(mockRepo.save).toHaveBeenCalledWith(input);
    });

    it('crée une activité avec toutes les propriétés', async () => {
      const timestamp = new Date('2024-01-01T10:00:00Z');
      const input = new Activity('user-123', 'Cycling', 90, 750, timestamp);
      const saved = new Activity('user-123', 'Cycling', 90, 750, timestamp, 'activity-456');

      mockRepo.save.mockResolvedValue(saved);

      const result = await service.createActivity(input);

      expect(result.userId).toBe('user-123');
      expect(result.type).toBe('Cycling');
      expect(result.duration).toBe(90);
      expect(result.calories).toBe(750);
      expect(result.timestamp).toEqual(timestamp);
      expect(result.id).toBe('activity-456');
      expect(mockRepo.save).toHaveBeenCalledWith(input);
    });
  });

  describe('putActivity', () => {
    it('met à jour une activité existante', async () => {
      const existing = new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'), 'activity1');
      const updates = { duration: 75, calories: 600 };
      const updated = { ...existing, ...updates };

      mockRepo.update.mockResolvedValue(updated as Activity);

      await expect(service.putActivity('activity1', updates)).resolves.toEqual(updated);
      expect(mockRepo.update).toHaveBeenCalledWith('activity1', updates);
    });

    it("retourne null si l'activité n'existe pas", async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(service.putActivity('missing', { duration: 75 })).resolves.toBeNull();
      expect(mockRepo.update).toHaveBeenCalledWith('missing', { duration: 75 });
    });

    it('met à jour partiellement une activité', async () => {
      const existing = new Activity('user1', 'Running', 60, 500, new Date('2024-01-01'), 'activity1');
      const updates = { type: 'Cycling' };
      const updated = { ...existing, ...updates };

      mockRepo.update.mockResolvedValue(updated as Activity);

      const result = await service.putActivity('activity1', updates);

      expect(result?.type).toBe('Cycling');
      expect(result?.duration).toBe(60);
      expect(result?.calories).toBe(500);
    });
  });

  describe('deleteActivity', () => {
    it('supprime une activité existante', async () => {
      mockRepo.delete.mockResolvedValue(true);

      await expect(service.deleteActivity('activity1')).resolves.toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('activity1');
    });

    it("retourne false si l'activité n'existe pas", async () => {
      mockRepo.delete.mockResolvedValue(false);

      await expect(service.deleteActivity('missing')).resolves.toBe(false);
      expect(mockRepo.delete).toHaveBeenCalledWith('missing');
    });
  });
});
