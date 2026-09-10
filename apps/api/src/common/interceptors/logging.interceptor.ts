import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, correlationId } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const durationMs = Date.now() - startTime;
        const statusCode = res.statusCode;

        this.logger.log(
          JSON.stringify({
            requestId: correlationId,
            method,
            url,
            statusCode,
            durationMs,
            userId: user?.id,
            organizationId: user?.org,
          }),
        );
      }),
    );
  }
}
