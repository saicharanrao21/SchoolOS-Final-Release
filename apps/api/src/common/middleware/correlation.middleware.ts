import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface CorrelatedRequest extends Request {
  correlationId?: string;
}

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: CorrelatedRequest, res: Response, next: NextFunction) {
    const existingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
    const correlationId = (Array.isArray(existingId) ? existingId[0] : existingId) || `req-${randomUUID()}`;

    req.correlationId = correlationId;
    res.setHeader('x-request-id', correlationId);

    next();
  }
}
