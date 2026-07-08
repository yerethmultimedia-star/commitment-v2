import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import type { NotificationProvider } from '../ports/notification-provider.port';

@Injectable()
export class ReminderWorkerService {
  private readonly logger = new Logger(ReminderWorkerService.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
    @Inject('NotificationProvider')
    private readonly notificationProvider: NotificationProvider,
  ) {}

  public async process(reminderId: string): Promise<void> {
    const reminder = await this.repository.findById(reminderId);

    if (!reminder) {
      this.logger.warn(`Reminder ${reminderId} not found, ignoring.`);
      return;
    }

    try {
      reminder.markProcessing();
      await this.repository.save(reminder);

      await this.notificationProvider.send(reminder.id, {
        commitmentId: reminder.commitmentId,
        identityId: reminder.identityId,
      });

      reminder.complete();
      await this.repository.save(reminder);
      this.logger.debug(`Reminder ${reminderId} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process reminder ${reminderId}`, error);
      reminder.fail(error instanceof Error ? error.message : 'Unknown error');
      await this.repository.save(reminder);
      throw error; // Rethrow so the execution engine can handle retries/DLQ
    }
  }
}
