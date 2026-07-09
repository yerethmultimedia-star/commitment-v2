import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import { OUTBOX_REPOSITORY_TOKEN } from '../../../messaging/application/ports/outbox.repository.port';
import type { OutboxRepository } from '../../../messaging/application/ports/outbox.repository.port';
import { ReminderQueuedMessageMapper } from '../mappers/reminder-queued-message.mapper';
import { ReminderQueuedEvent } from '@commitment/domain';
import { RequestContext } from '@commitment/shared';
import * as crypto from 'crypto';

@Injectable()
export class ReminderDispatcher {
  private readonly logger = new Logger(ReminderDispatcher.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: OutboxRepository,
    private readonly mapper: ReminderQueuedMessageMapper,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async dispatchReadyReminders(): Promise<void> {
    return RequestContext.runWithNewContext(async () => {
      const now = new Date();
      const readyReminders = await this.repository.findReady(now);
      const correlationId = RequestContext.currentCorrelationId()!;
      const causationId = RequestContext.currentCausationId()!;

      for (const reminder of readyReminders) {
        try {
          this.logger.debug(`Dispatching reminder ${reminder.id}`);

          reminder.markQueued();

          // Map domain events to integration messages
          const events = reminder.getUncommittedEvents();
          const messages = events
            .filter((e) => e.name === 'reminder.queued')
            .map((e) => {
              const event = e as ReminderQueuedEvent;
              const metadata = event.metadata as unknown as Record<
                string,
                unknown
              >;
              if (!metadata.correlationId)
                metadata.correlationId = correlationId;
              if (!metadata.causationId) metadata.causationId = causationId;
              if (!metadata.eventId) metadata.eventId = crypto.randomUUID();
              return this.mapper.mapToIntegrationMessage(event);
            });

          // Persist transactionally
          await this.repository.save(reminder);
          if (messages.length > 0) {
            await this.outboxRepository.append(messages);
          }

          reminder.clearUncommittedEvents();
        } catch (error) {
          this.logger.error(
            `Failed to dispatch reminder ${reminder.id}`,
            error,
          );
        }
      }
    });
  }
}
