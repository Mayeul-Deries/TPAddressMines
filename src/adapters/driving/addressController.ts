import express from 'express';
import { InMemoryAddressRepo } from '../driven/inMemoryAddressRepo';
import { AddressService } from '../../services/userService';
import { Address } from "../../domain/user";

const router = express.Router();

const repo = new InMemoryAddressRepo();
const service = new AddressService(repo);

router.get('/', async (req, res) => {
  const list = await service.listAddresses();
  res.json(list);
});

router.post('/', async (req, res) => {
  const { street, city, zip } = req.body;
  if (!street || !city || !zip) {
    return res.status(400).json({ message: 'street, city and zip required' });
  }
  const created = await service.createAddress(new Address(street, city, zip));
  res.status(201).json(created);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const found = await service.getAddress(id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  res.json(found);
});

export default router;
