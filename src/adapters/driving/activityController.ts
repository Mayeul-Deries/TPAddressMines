import express from 'express';
import { InMemoryActivityRepo } from '../driven/inMemoryUserRepo';
import { ActivityService } from '../../services/userService';
import { Activity } from "../../domain/activity";

const router = express.Router();

const repo = new InMemoryActivityRepo();
const service = new ActivityService(repo);

router.get('/', async (req, res) => {
  const list = await service.listActivities();
  res.json(list);
});

router.post('/', async (req, res) => {
  const { street, city, zip } = req.body;
  if (!street || !city || !zip) {
    return res.status(400).json({ message: 'street, city and zip required' });
  }
  const created = await service.createActivity(new Activity(street, city, zip));
  res.status(201).json(created);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const found = await service.getAddress(id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  res.json(found);
});

export default router;
