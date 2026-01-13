import express, { Express } from 'express';
import { InMemoryActivityRepo } from '../driven/inMemoryActivityRepo';
import { ActivityService } from '../../services/activityService';
import { Activity } from "../../domain/activity";
import { ActivityRepositoryPort } from "../../ports/driven/repoPort";
import { ActivityPort } from "../../ports/driving/activityPort";
import {Request, Response} from "express";

export class ActivityController {
  private service: ActivityPort;

  constructor(private readonly activityService: ActivityPort) {
    this.service = activityService;
  }

  registerRoutes(app: Express) {
    app.get('/activities', this.getAllActivities.bind(this));
    app.post('/activities', this.createActivity.bind(this));
    app.get('/activities/:id', this.getActivity.bind(this));
  }

  async getAllActivities(req: Request, res: Response) {
    const list = await this.service.listActivities();
    res.json(list);
  }

  async createActivity(req: Request, res: Response) {
    const { street, city, zip } = req.body;
    if (!street || !city || !zip) {
      return res.status(400).json({ message: 'street, city and zip required' });
    }
    const created = await this.service.createActivity(new Activity("1", "running", 30, 5.0, new Date(), "10:00"));
    res.status(201).json(created);
  }

  async getActivity(req: Request, res: Response) {
    const id = req.params.id;
    const found = await this.service.getActivity(id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    res.json(found);
  }
}
