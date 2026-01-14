import { ActivityController } from './activityController';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('ActivityController (unit, jest-only)', () => {
  let mockService: any;
  let controller: ActivityController;

  beforeEach(() => {
    mockService = {
      listActivities: jest.fn(),
      createActivity: jest.fn(),
      getActivity: jest.fn(),
      putActivity: jest.fn(),
      deleteActivity: jest.fn(),
    };
    controller = new ActivityController(mockService);
  });

  afterEach(() => jest.resetAllMocks());

  it('registers expected routes on an Express-like app', () => {
    const mockApp: any = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
    controller.registerRoutes(mockApp);
    expect(mockApp.get).toHaveBeenCalledWith('/activities', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/activities', expect.any(Function));
    expect(mockApp.get).toHaveBeenCalledWith('/activities/:id', expect.any(Function));
    expect(mockApp.put).toHaveBeenCalledWith('/activities/:id', expect.any(Function));
    expect(mockApp.delete).toHaveBeenCalledWith('/activities/:id', expect.any(Function));
  });

  describe('getAllActivities', () => {
    it('returns list of activities', async () => {
      const list = [{ id: 'a1' }];
      mockService.listActivities.mockResolvedValue(list);
      const req: any = {};
      const res = mockRes();
      await controller.getAllActivities(req, res);
      expect(res.json).toHaveBeenCalledWith(list);
    });
  });

  describe('createActivity', () => {
    it('returns 400 when required fields missing', async () => {
      const req: any = { body: { } };
      const res = mockRes();
      await controller.createActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls service.createActivity and returns 201', async () => {
      const payload = { userId: 'u1', type: 'running', duration: 30, calories: 200, timestamp: new Date().toISOString() };
      const created = { id: 'a1', ...payload };
      mockService.createActivity.mockResolvedValue(created);

      const req: any = { body: payload };
      const res = mockRes();
      await controller.createActivity(req, res);

      expect(mockService.createActivity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  describe('getActivity', () => {
    it('returns 404 when not found', async () => {
      mockService.getActivity.mockResolvedValue(null);
      const req: any = { params: { id: 'a1' } };
      const res = mockRes();
      await controller.getActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 when found', async () => {
      const act = { id: 'a1' };
      mockService.getActivity.mockResolvedValue(act);
      const req: any = { params: { id: 'a1' } };
      const res = mockRes();
      await controller.getActivity(req, res);
      expect(res.json).toHaveBeenCalledWith(act);
    });
  });

  describe('putActivity', () => {
    it('returns 404 when putActivity returns null', async () => {
      mockService.putActivity.mockResolvedValue(null);
      const req: any = { params: { id: 'a1' }, body: { duration: 10 } };
      const res = mockRes();
      await controller.putActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 when updated', async () => {
      const updated = { id: 'a1', duration: 10 };
      mockService.putActivity.mockResolvedValue(updated);
      const req: any = { params: { id: 'a1' }, body: { duration: 10 } };
      const res = mockRes();
      await controller.putActivity(req, res);
      expect(res.json).toHaveBeenCalledWith(updated);
    });
  });

  describe('deleteActivity', () => {
    it('returns 404 when delete fails', async () => {
      mockService.deleteActivity.mockResolvedValue(false);
      const req: any = { params: { id: 'a1' } };
      const res = mockRes();
      await controller.deleteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 204 when deleted', async () => {
      mockService.deleteActivity.mockResolvedValue(true);
      const req: any = { params: { id: 'a1' } };
      const res = mockRes();
      await controller.deleteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
