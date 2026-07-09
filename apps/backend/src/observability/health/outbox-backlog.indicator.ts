import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { OUTBOX_REPOSITORY_TOKEN } from '../../messaging/application/ports/outbox.repository.port';
import type { OutboxRepository } from '../../messaging/application/ports/outbox.repository.port';

@Injectable()
export class OutboxBacklogIndicator extends HealthIndicator {
  constructor(
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: OutboxRepository,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pendingCount = await this.outboxRepository.countPending();
      const deadLetterCount = await this.outboxRepository.countDeadLetter();

      const isHealthy = pendingCount < 1000 && deadLetterCount < 100;
      const result = this.getStatus(key, isHealthy, {
        pendingCount,
        deadLetterCount,
      });

      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('Outbox backlog too high', result);
    } catch (e: unknown) {
      if (e instanceof HealthCheckError) throw e;
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw new HealthCheckError(
        'Outbox check failed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
