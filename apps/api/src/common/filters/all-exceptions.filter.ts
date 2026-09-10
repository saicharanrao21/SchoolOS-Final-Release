import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string; user?: any }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const requestId = request.correlationId || `req-${Date.now()}`;

    // Log structured error without leaking stack trace in production
    this.logger.error(
      JSON.stringify({
        requestId,
        method: request.method,
        url: request.url,
        statusCode: status,
        message,
        userId: request.user?.id,
        organizationId: request.user?.org,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}

import { Injectable } from '@nestjs/common';
