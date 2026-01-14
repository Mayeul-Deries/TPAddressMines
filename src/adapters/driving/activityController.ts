import express, { Express } from 'express';
import { InMemoryActivityRepo } from '../driven/inMemoryActivityRepo';
import { ActivityService } from '../../services/activityService';
import { Activity } from '../../domain/activity';
import { ActivityRepositoryPort } from '../../ports/driven/repoPort';
import { ActivityPort } from '../../ports/driving/activityPort';
import { Request, Response } from 'express';

export class ActivityController {
  private service: ActivityPort;

  constructor(private readonly activityService: ActivityPort) {
    this.service = activityService;
  }

  registerRoutes(app: Express) {
    app.get('/activities', this.getAllActivities.bind(this));
    app.post('/activities', this.createActivity.bind(this));
    app.get('/activities/:id', this.getActivity.bind(this));
    app.put('/activities/:id', this.putActivity.bind(this));
    app.delete('/activities/:id', this.deleteActivity.bind(this));
  }

  async getAllActivities(req: Request, res: Response) {
    const list = await this.service.listActivities();
    res.json(list);
  }

  async createActivity(req: Request, res: Response) {
    const { userId, type, duration, calories, timestamp } = req.body;
    if (!userId || !type || !duration || !calories || !timestamp) {
      return res.status(400).json({ message: 'userId, type, duration, calories and timestamp required' });
    }
    const created = await this.service.createActivity(new Activity('1', 'running', 30, 5.0, new Date(), '10:00'));
    res.status(201).json(created);
  }

  async getActivity(req: Request, res: Response) {
    const id = req.params.id;
    const found = await this.service.getActivity(id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    res.json(found);
  }

  async putActivity(req: Request, res: Response) {
    const id = req.params.id;
    const updates: Partial<Activity> = req.body;

    const updated = await this.service.putActivity(id, updates);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  }

  async deleteActivity(req: Request, res: Response) {
    const id = req.params.id;

    const success = await this.service.deleteActivity(id);
    if (!success) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  }
}
