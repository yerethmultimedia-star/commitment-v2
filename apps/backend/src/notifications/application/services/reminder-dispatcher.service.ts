import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import type { ReminderExecutionEngine } from '../ports/reminder-execution-engine.port';

@Injectable()
export class ReminderDispatcher {
  private readonly logger = new Logger(ReminderDispatcher.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
    @Inject('ReminderExecutionEngine')
    private readonly engine: ReminderExecutionEngine,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async dispatchReadyReminders(): Promise<void> {
    const now = new Date();
    const readyReminders = await this.repository.findReady(now);

    for (const reminder of readyReminders) {
      try {
        this.logger.debug(`Dispatching reminder ${reminder.id}`);
        // Known Limitation: We enqueue before save. To be fixed with Outbox in VS-013.
        await this.engine.enqueue(reminder.id);

        reminder.markQueued();
        await this.repository.save(reminder);
      } catch (error) {
        this.logger.error(`Failed to dispatch reminder ${reminder.id}`, error);
      }
    }
  }
}
