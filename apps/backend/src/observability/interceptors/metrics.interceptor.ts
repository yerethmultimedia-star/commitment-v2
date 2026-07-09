import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_ms')
    private readonly histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const routePath = (req.route as { path?: string })?.path;
    const end = this.histogram.startTimer({
      method: req.method,
      route: routePath || req.url,
    });

    return next.handle().pipe(
      tap(() => {
        const res = ctx.getResponse<Response>();
        end({ status_code: res.statusCode.toString() });
      }),
    );
  }
}
