import { Injectable, Inject, Logger } from '@nestjs/common';
import { Reminder } from '@commitment/domain';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import type {
  NotificationProvider,
  NotificationMessage,
} from '../ports/notification-provider.port';
import type { NotificationDeviceProjectionRepository } from '../ports/notification-device-projection.repository';
import { InMemoryHabitProjectionStore } from '../../../habit/infrastructure/in-memory-habit-projection.store';

@Injectable()
export class ReminderWorkerService {
  private readonly logger = new Logger(ReminderWorkerService.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
    @Inject('NotificationProvider')
    private readonly notificationProvider: NotificationProvider,
    @Inject('NotificationDeviceProjectionRepository')
    private readonly deviceProjectionRepository: NotificationDeviceProjectionRepository,
    @Inject('HabitProjectionStore')
    private readonly habitProjectionStore: InMemoryHabitProjectionStore,
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

      const device = await this.deviceProjectionRepository.findByIdentityId(
        reminder.identityId,
      );

      if (!device) {
        this.logger.warn(
          `No device projection found for identity ${reminder.identityId}. Skipping notification.`,
        );
        // We consider it completed since we can't do anything else.
        reminder.complete();
        await this.repository.save(reminder);
        return;
      }

      const message = this.buildMessage(reminder, device.pushToken);

      await this.notificationProvider.send(message);

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

  private buildMessage(
    reminder: Reminder,
    pushToken: string,
  ): NotificationMessage {
    const baseMetadata = {
      reminderId: reminder.id,
      sourceId: reminder.sourceId,
      sourceType: reminder.sourceType,
    };

    if (reminder.sourceType === 'habit') {
      const habit = this.habitProjectionStore.findById(reminder.sourceId);
      return {
        identityId: reminder.identityId,
        pushToken,
        title: habit ? habit.title : 'Habit Reminder',
        body: 'Time for your habit!',
        metadata: baseMetadata,
      };
    }

    return {
      identityId: reminder.identityId,
      pushToken,
      title: 'Commitment Reminder',
      body: 'It is time for your commitment!', // We might want to look up commitment details, but Reminder aggregate doesn't have it right now.
      metadata: baseMetadata,
    };
  }
}
