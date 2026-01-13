import { Express, Request, Response } from 'express';
import { User } from '../../domain/user';
import { UserPort } from '../../ports/driving/userPort';

export class UserController {
  private readonly service: UserPort;

  constructor(private readonly userService: UserPort) {
    this.service = userService;
  }

  registerRoutes(app: Express) {
    app.post('/users', this.createUser.bind(this));
    app.get('/users', this.listUsers.bind(this));
    app.get('/users/:id', this.getUser.bind(this));
    app.put('/users/:id', this.updateUser.bind(this));
    app.delete('/users/:id', this.deleteUser.bind(this));
    app.get('/users/:id/stats', this.getUserStats.bind(this));
  }

  async createUser(req: Request, res: Response) {
    try {
      const { surname, name, age, email, height, weight, main_sport, nationality } = req.body;

      if (!surname || !name || !email || !height || !weight || !main_sport) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: surname, name, email, height, weight, main_sport' });
      }

      const user = new User(surname, name, age || 0, email, height, weight, main_sport, nationality || '');
      const created = await this.service.createUser(user as any);
      res.status(201).json(created);
    } catch (error: any) {
      if (error.message === 'Email already taken') {
        return res.status(409).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async listUsers(req: Request, res: Response) {
    try {
      const list = await this.service.listUsers();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const found = await this.service.getUser(id);
      if (!found) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(found);
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const { surname, name, age, email, height, weight, main_sport, nationality } = req.body;

      // Vérifier qu'au moins un champ est fourni
      if (!surname && !name && age === undefined && !email && !height && !weight && !main_sport && !nationality) {
        return res.status(400).json({ message: 'At least one field must be provided' });
      }

      const updateData: Partial<User> = {};
      if (surname !== undefined) updateData.surname = surname;
      if (name !== undefined) updateData.name = name;
      if (age !== undefined) updateData.age = age;
      if (email !== undefined) updateData.email = email;
      if (height !== undefined) updateData.height = height;
      if (weight !== undefined) updateData.weight = weight;
      if (main_sport !== undefined) updateData.main_sport = main_sport;
      if (nationality !== undefined) updateData.nationality = nationality;

      const updated = await this.service.updateUser(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updated);
    } catch (error: any) {
      if (error.message.includes('Email already taken')) {
        return res.status(409).json({ message: error.message });
      }
      if (error.message.includes('positive')) {
        return res.status(422).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const deleted = await this.service.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const user = await this.service.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

  const stats = await (this.service as any).getUserStats(id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}
