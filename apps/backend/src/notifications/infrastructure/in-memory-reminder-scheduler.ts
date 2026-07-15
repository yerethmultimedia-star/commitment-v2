import { ReminderSchedulerPort } from '../application/ports/reminder-scheduler.port';
import type { ReminderRepository } from '../application/ports/reminder.repository.port';
import {
  Reminder,
  ReminderStatus,
  ReminderSourceType,
} from '@commitment/domain';
import { randomUUID } from 'crypto';
import { Injectable, Inject, Logger } from '@nestjs/common';

@Injectable()
export class InMemoryReminderScheduler implements ReminderSchedulerPort {
  private readonly logger = new Logger(InMemoryReminderScheduler.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
  ) {}

  public async schedule(
    sourceId: string,
    sourceType: ReminderSourceType,
    identityId: string,
    targetDateStr?: string,
  ): Promise<void> {
    if (!targetDateStr) {
      this.logger.debug(
        `No target date provided, skipping reminder for ${sourceType}:${sourceId}`,
      );
      return;
    }

    let reminder = await this.repository.findBySourceId(sourceId, sourceType);
    const targetDate = new Date(targetDateStr);

    if (!reminder) {
      reminder = Reminder.create(
        randomUUID(),
        sourceId,
        sourceType,
        identityId,
        targetDate,
      );
    } else {
      reminder.schedule(targetDate);
    }

    await this.repository.save(reminder);
    this.logger.log(
      `Scheduled reminder for ${sourceType}:${sourceId} at ${targetDateStr}`,
    );
  }

  public async suspend(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<void> {
    const reminder = await this.repository.findBySourceId(sourceId, sourceType);
    if (reminder) {
      reminder.suspend();
      await this.repository.save(reminder);
      this.logger.log(`Suspended reminder for ${sourceType}:${sourceId}`);
    }
  }

  public async reschedule(
    sourceId: string,
    sourceType: ReminderSourceType,
    targetDateStr?: string,
  ): Promise<void> {
    const reminder = await this.repository.findBySourceId(sourceId, sourceType);
    if (reminder) {
      const targetDate = targetDateStr ? new Date(targetDateStr) : undefined;
      reminder.resume(targetDate);
      await this.repository.save(reminder);
      this.logger.log(`Rescheduled reminder for ${sourceType}:${sourceId}`);
    } else {
      this.logger.warn(
        `Cannot reschedule unknown reminder for ${sourceType}:${sourceId}`,
      );
    }
  }

  public async cancel(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<void> {
    const reminder = await this.repository.findBySourceId(sourceId, sourceType);
    if (reminder) {
      reminder.cancel();
      await this.repository.save(reminder);
      this.logger.log(`Cancelled reminder for ${sourceType}:${sourceId}`);
    }
  }

  // Exposed for testing
  public async isScheduled(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<boolean> {
    const reminder = await this.repository.findBySourceId(sourceId, sourceType);
    return reminder?.status === ReminderStatus.Scheduled;
  }

  public async isSuspended(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<boolean> {
    const reminder = await this.repository.findBySourceId(sourceId, sourceType);
    return reminder?.status === ReminderStatus.Suspended;
  }
}
