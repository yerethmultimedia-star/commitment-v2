import { Global, Module } from '@nestjs/common';
import {
  makeHistogramProvider,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

export const COMMAND_DURATION_HISTOGRAM = 'command_duration_ms';
export const HTTP_REQUEST_DURATION_HISTOGRAM = 'http_request_duration_ms';

const providers = [
  makeHistogramProvider({
    name: COMMAND_DURATION_HISTOGRAM,
    help: 'Latency of CQRS commands',
    labelNames: ['command_name'],
    buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
  }),
  makeHistogramProvider({
    name: HTTP_REQUEST_DURATION_HISTOGRAM,
    help: 'Latency of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
  }),
  makeCounterProvider({
    name: 'commitments_created_total',
    help: 'Total number of commitments created',
  }),
  makeCounterProvider({
    name: 'goals_created_total',
    help: 'Total number of goals created',
  }),
  makeCounterProvider({
    name: 'notifications_sent_total',
    help: 'Total number of notifications sent',
  }),
  makeCounterProvider({
    name: 'outbox_deadletter_total',
    help: 'Total number of outbox messages sent to Dead Letter Queue',
  }),
  makeCounterProvider({
    name: 'processed_messages_total',
    help: 'Total number of integration messages processed',
  }),
];

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class ObservabilityModule {}
