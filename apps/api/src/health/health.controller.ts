import { Controller, Get, HttpStatus, Res, ServiceUnavailableException } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    let dbStatus = 'disconnected';
    let pendingOutboxCount = 0;
    let failedOutboxCount = 0;

    try {
      await this.db.$queryRaw`SELECT 1`;
      dbStatus = 'connected';

      const [pending, failed] = await Promise.all([
        this.db.outboxEvent.count({ where: { status: 'PENDING' } }),
        this.db.outboxEvent.count({ where: { status: 'FAILED' } }),
      ]);
      pendingOutboxCount = pending;
      failedOutboxCount = failed;
    } catch (e) {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      outbox: {
        pending: pendingOutboxCount,
        failed: failedOutboxCount,
      },
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  liveness() {
    return {
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async readiness(@Res() res: Response) {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return res.status(HttpStatus.OK).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unready',
        database: 'disconnected',
        error: 'Database query failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('metrics')
  async metrics() {
    const memory = process.memoryUsage();
    const [pendingOutbox, failedOutbox] = await Promise.all([
      this.db.outboxEvent.count({ where: { status: 'PENDING' } }).catch(() => 0),
      this.db.outboxEvent.count({ where: { status: 'FAILED' } }).catch(() => 0),
    ]);

    return {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      },
      queueMetrics: {
        outboxPending: pendingOutbox,
        outboxFailed: failedOutbox,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
