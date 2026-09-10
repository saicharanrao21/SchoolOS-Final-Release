import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../health/health.controller';
import { DatabaseService } from '../../database/database.service';
import { CorrelationMiddleware } from '../../common/middleware/correlation.middleware';
import { HttpStatus } from '@nestjs/common';

describe('DevOps, Observability & Health Probes Test Suite (Phase 32)', () => {
  let controller: HealthController;
  let db: any;

  beforeEach(async () => {
    db = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      outboxEvent: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DatabaseService, useValue: db }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health', () => {
    it('should return system health summary with database status and outbox queue metrics', async () => {
      const res = await controller.check();
      expect(res.status).toBe('ok');
      expect(res.database).toBe('connected');
      expect(res.outbox).toEqual({ pending: 0, failed: 0 });
      expect(res.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status alive and process uptime', () => {
      const res = controller.liveness();
      expect(res.status).toBe('alive');
      expect(res.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return HTTP 200 ready when database query succeeds', async () => {
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await controller.readiness(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
          database: 'connected',
        })
      );
    });

    it('should return HTTP 503 SERVICE_UNAVAILABLE when database query fails', async () => {
      db.$queryRaw.mockRejectedValue(new Error('DB connection refused'));

      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await controller.readiness(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unready',
          database: 'disconnected',
        })
      );
    });
  });

  describe('Correlation ID Middleware', () => {
    it('should generate x-request-id correlation header if not provided by client', () => {
      const middleware = new CorrelationMiddleware();
      const req: any = { headers: {} };
      const res: any = { setHeader: jest.fn() };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(req.correlationId).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.correlationId);
      expect(next).toHaveBeenCalled();
    });
  });
});
