import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import { OUTBOX_REPOSITORY_TOKEN } from '../../../messaging/application/ports/outbox.repository.port';
import type { OutboxRepository } from '../../../messaging/application/ports/outbox.repository.port';
import { ReminderQueuedMessageMapper } from '../mappers/reminder-queued-message.mapper';
import { ReminderQueuedEvent } from '@commitment/domain';

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
    const now = new Date();
    const readyReminders = await this.repository.findReady(now);

    for (const reminder of readyReminders) {
      try {
        this.logger.debug(`Dispatching reminder ${reminder.id}`);

        reminder.markQueued();

        // Map domain events to integration messages
        const events = reminder.getUncommittedEvents();
        const messages = events
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .filter((e: any) => e.name === 'reminder.queued')
          .map((e: any) =>
            this.mapper.mapToIntegrationMessage(e as ReminderQueuedEvent),
          );

        // Persist transactionally
        await this.repository.save(reminder);
        if (messages.length > 0) {
          await this.outboxRepository.append(messages);
        }

        reminder.clearUncommittedEvents();
      } catch (error) {
        this.logger.error(`Failed to dispatch reminder ${reminder.id}`, error);
      }
    }
  }
}
