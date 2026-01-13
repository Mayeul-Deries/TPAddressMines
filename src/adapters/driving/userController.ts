import express from 'express';
import { InMemoryUserRepo } from '../driven/inMemoryUserRepo';
import { InMemoryActivityRepo } from '../driven/inMemoryActivityRepo';
import { UserService } from '../../services/userService';
import { User } from '../../domain/user';

const router = express.Router();

const repo = new InMemoryUserRepo();
const activityRepo = new InMemoryActivityRepo();
const service = new UserService([repo], activityRepo);

// POST /users - Créer un profil
router.post('/', async (req, res) => {
  try {
    const { surname, name, age, email, height, weight, main_sport, nationality } = req.body;

    if (!surname || !name || !email || !height || !weight || !main_sport) {
      return res
        .status(400)
        .json({ message: 'Missing required fields: surname, name, email, height, weight, main_sport' });
    }

    const user = new User(surname, name, age || 0, email, height, weight, main_sport, nationality || '');
    const created = await service.createUser(user);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message === 'Email already taken') {
      return res.status(409).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
});

// GET /users - Liste de tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const list = await service.listUsers();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /users/:id - Détails d'un profil
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const found = await service.getUser(id);
    if (!found) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(found);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT /users/:id - Update profil
router.put('/:id', async (req, res) => {
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

    const updated = await service.updateUser(id, updateData);
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
});

// DELETE /users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const deleted = await service.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /users/:id/stats - Dashboard de l'utilisateur
router.get('/:id/stats', async (req, res) => {
  try {
    const id = req.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const user = await service.getUser(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = await service.getUserStats(id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
