import express, { Express } from 'express';
import { InMemoryAddressRepo } from '../driven/inMemoryAddressRepo';
import { AddressService } from '../../services/addressService';
import { Address } from "../../domain/address";
import { AddressRepositoryPort } from "../../ports/driven/repoPort";
import { AddressPort } from "../../ports/driving/addressPort";
import {Request, Response} from "express";

const router = express.Router();

export class AddressController {
  private service: AddressPort;

  constructor(private readonly addressRepo: AddressRepositoryPort) {
    this.service = new AddressService(addressRepo);
  }

  registerRoutes(app: Express) {
    app.get('/addresses', this.getAllAddresses.bind(this));
    app.post('/addresses', this.createAddress.bind(this));
    app.get('/addresses/:id', this.getAddress.bind(this));
  }

  async getAllAddresses(req: Request, res: Response) {
    const list = await this.service.listAddresses();
    res.json(list);
  }

  async createAddress(req: Request, res: Response) {
    const { street, city, zip } = req.body;
    if (!street || !city || !zip) {
      return res.status(400).json({ message: 'street, city and zip required' });
    }
    const created = await this.service.createAddress(new Address(street, city, zip));
    res.status(201).json(created);
  }

  async getAddress(req: Request, res: Response) {
    const id = req.params.id;
    const found = await this.service.getAddress(id);
    if (!found) return res.status(404).json({ message: 'Not found' });
    res.json(found);
  }
}

export default router;
