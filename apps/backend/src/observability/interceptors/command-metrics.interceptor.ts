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
import { COMMAND_DURATION_HISTOGRAM } from '../observability.module';

@Injectable()
export class CommandMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(COMMAND_DURATION_HISTOGRAM)
    private readonly histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // We only track commands that come from controllers or handlers
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const end = this.histogram.startTimer({
      command_name: `${className}.${handlerName}`,
    });

    return next.handle().pipe(
      tap(() => {
        end();
      }),
    );
  }
}
