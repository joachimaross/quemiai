import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { httpRequestCounter, httpRequestDuration } from '../metrics/http.metrics';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        const method = request.method;
        const route = request.route?.path || request.url;
        const statusCode = response.statusCode;

        // Record metrics
        httpRequestCounter.inc({
          method,
          route,
          status_code: statusCode,
        });

        httpRequestDuration.observe(
          {
            method,
            route,
            status_code: statusCode,
          },
          duration,
        );
      }),
    );
  }
}
