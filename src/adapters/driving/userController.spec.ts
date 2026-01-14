import { UserController } from './userController';

const validUuid = '11111111-1111-1111-1111-111111111111';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('UserController (unit, jest-only)', () => {
  let mockService: any;
  let controller: UserController;

  beforeEach(() => {
    mockService = {
      listUsers: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserStats: jest.fn(),
    };
    controller = new UserController(mockService);
  });

  afterEach(() => jest.resetAllMocks());

  describe('registerRoutes', () => {
    it('registers expected routes on an Express-like app', () => {
      const mockApp: any = {
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      controller.registerRoutes(mockApp);

      expect(mockApp.post).toHaveBeenCalledWith('/users', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/users', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/users/:id', expect.any(Function));
      expect(mockApp.put).toHaveBeenCalledWith('/users/:id', expect.any(Function));
      expect(mockApp.delete).toHaveBeenCalledWith('/users/:id', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/users/:id/stats', expect.any(Function));
    });
  });

  describe('createUser', () => {
    it('returns 400 when required fields missing', async () => {
      const req: any = { body: {} };
      const res = mockRes();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates a user and returns 201', async () => {
      const payload = { surname: 'Doe', name: 'John', age: 30, email: 'john@example.com', height: 180, weight: 75, main_sport: 'Running' };
      const created = { id: validUuid, ...payload };
      mockService.createUser.mockResolvedValue(created);

      const req: any = { body: payload };
      const res = mockRes();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
      expect(mockService.createUser).toHaveBeenCalled();
    });

    it('returns 409 when email already taken on create', async () => {
      const payload = { surname: 'Doe', name: 'John', age: 30, email: 'john@example.com', height: 180, weight: 75, main_sport: 'Running' };
      mockService.createUser.mockRejectedValue(new Error('Email already taken'));

      const req: any = { body: payload };
      const res = mockRes();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('returns 400 when service throws generic error on create', async () => {
      const payload = { surname: 'Doe', name: 'John', age: 30, email: 'john@example.com', height: 180, weight: 75, main_sport: 'Running' };
      mockService.createUser.mockRejectedValue(new Error('unexpected'));

      const req: any = { body: payload };
      const res = mockRes();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes default age 0 and empty nationality when omitted', async () => {
      const payload = { surname: 'Doe', name: 'John', email: 'john@example.com', height: 180, weight: 75, main_sport: 'Running' };
      const created = { id: validUuid, ...payload, age: 0, nationality: '' };
      mockService.createUser.mockResolvedValue(created);

      const req: any = { body: payload };
      const res = mockRes();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockService.createUser).toHaveBeenCalledWith(expect.objectContaining({ age: 0, nationality: '' }));
    });
  });

  describe('listUsers', () => {
    it('returns list of users', async () => {
      const list = [{ id: validUuid, surname: 'Doe' }];
      mockService.listUsers.mockResolvedValue(list);
      const req: any = {};
      const res = mockRes();
      await controller.listUsers(req, res);
      expect(res.json).toHaveBeenCalledWith(list);
    });

    it('returns 500 on service error', async () => {
      mockService.listUsers.mockRejectedValue(new Error('boom'));
      const req: any = {};
      const res = mockRes();
      await controller.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error', error: 'boom' }));
    });
  });

  describe('getUser', () => {
    it('returns 400 for invalid id format', async () => {
      const req: any = { params: { id: 'not-a-uuid' } };
      const res = mockRes();
      await controller.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when user not found', async () => {
      mockService.getUser.mockResolvedValue(null);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 when user found', async () => {
      const user = { id: validUuid, surname: 'Doe' };
      mockService.getUser.mockResolvedValue(user);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUser(req, res);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('returns 500 when service throws', async () => {
      mockService.getUser.mockRejectedValue(new Error('boom'));
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateUser', () => {
    it('returns 400 for invalid id', async () => {
      const req: any = { params: { id: 'abc' }, body: { name: 'X' } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when no fields provided', async () => {
      const req: any = { params: { id: validUuid }, body: {} };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when update returns null', async () => {
      mockService.updateUser.mockResolvedValue(null);
      const req: any = { params: { id: validUuid }, body: { name: 'New' } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 on successful update', async () => {
      const updated = { id: validUuid, name: 'Updated' };
      mockService.updateUser.mockResolvedValue(updated);
      const req: any = { params: { id: validUuid }, body: { name: 'Updated' } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('sends all provided fields to the service on update', async () => {
      const payload = { surname: 'S', name: 'N', age: 25, email: 'a@b.com', height: 170, weight: 70, main_sport: 'Biking', nationality: 'FR' };
      const updated = { id: validUuid, ...payload };
      mockService.updateUser.mockResolvedValue(updated);
      const req: any = { params: { id: validUuid }, body: payload };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(mockService.updateUser).toHaveBeenCalledWith(validUuid, expect.objectContaining(payload));
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('returns 409 if email already taken', async () => {
      mockService.updateUser.mockRejectedValue(new Error('Email already taken'));
      const req: any = { params: { id: validUuid }, body: { email: 'taken@example.com' } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('returns 422 for validation errors containing "positive"', async () => {
      mockService.updateUser.mockRejectedValue(new Error('Height must be positive'));
      const req: any = { params: { id: validUuid }, body: { height: -1 } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('returns 400 for generic service errors on update', async () => {
      mockService.updateUser.mockRejectedValue(new Error('something went wrong'));
      const req: any = { params: { id: validUuid }, body: { name: 'Any' } };
      const res = mockRes();
      await controller.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteUser', () => {
    it('returns 400 for invalid id', async () => {
      const req: any = { params: { id: 'abc' } };
      const res = mockRes();
      await controller.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when delete returns false', async () => {
      mockService.deleteUser.mockResolvedValue(false);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 204 when delete succeeds', async () => {
      mockService.deleteUser.mockResolvedValue(true);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('returns 500 when delete throws', async () => {
      mockService.deleteUser.mockRejectedValue(new Error('boom'));
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserStats', () => {
    it('returns 400 for invalid id', async () => {
      const req: any = { params: { id: 'abc' } };
      const res = mockRes();
      await controller.getUserStats(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when user not found', async () => {
      mockService.getUser.mockResolvedValue(null);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUserStats(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 with stats when present', async () => {
      const user = { id: validUuid };
      const stats = { imc: 22 };
      mockService.getUser.mockResolvedValue(user);
      mockService.getUserStats.mockResolvedValue(stats);
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUserStats(req, res);
      expect(res.json).toHaveBeenCalledWith(stats);
    });

    it('returns 500 when getUserStats throws', async () => {
      const user = { id: validUuid };
      mockService.getUser.mockResolvedValue(user);
      mockService.getUserStats.mockRejectedValue(new Error('boom'));
      const req: any = { params: { id: validUuid } };
      const res = mockRes();
      await controller.getUserStats(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
