import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { OutboxBacklogIndicator } from './outbox-backlog.indicator';
import { ProjectionLagIndicator } from './projection-lag.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private outboxBacklogIndicator: OutboxBacklogIndicator,
    private projectionLagIndicator: ProjectionLagIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.outboxBacklogIndicator.isHealthy('outbox_backlog'),
      () => this.projectionLagIndicator.isHealthy('projection_lag'),
    ]);
  }
}
