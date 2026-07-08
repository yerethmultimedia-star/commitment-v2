import { ReminderSchedulerPort } from '../application/ports/reminder-scheduler.port';
import type { ReminderRepository } from '../application/ports/reminder.repository.port';
import { Reminder, ReminderStatus } from '@commitment/domain';
import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class InMemoryReminderScheduler implements ReminderSchedulerPort {
  constructor(
    @Inject('ReminderRepository')
    private readonly repository: ReminderRepository,
  ) {}

  public async schedule(
    commitmentId: string,
    identityId: string,
    targetDateStr?: string,
  ): Promise<void> {
    if (!targetDateStr) {
      console.log(
        `[InMemoryReminderScheduler] No target date provided, skipping reminder for ${commitmentId}`,
      );
      return;
    }

    let reminder = await this.repository.findByCommitmentId(commitmentId);
    const targetDate = new Date(targetDateStr);

    if (!reminder) {
      reminder = Reminder.create(
        randomUUID(),
        commitmentId,
        identityId,
        targetDate,
      );
    } else {
      reminder.schedule(targetDate);
    }

    await this.repository.save(reminder);
    console.log(
      `[InMemoryReminderScheduler] Scheduled reminder for ${commitmentId} at ${targetDateStr}`,
    );
  }

  public async suspend(commitmentId: string): Promise<void> {
    const reminder = await this.repository.findByCommitmentId(commitmentId);
    if (reminder) {
      reminder.suspend();
      await this.repository.save(reminder);
      console.log(
        `[InMemoryReminderScheduler] Suspended reminder for ${commitmentId}`,
      );
    }
  }

  public async reschedule(
    commitmentId: string,
    targetDateStr?: string,
  ): Promise<void> {
    const reminder = await this.repository.findByCommitmentId(commitmentId);
    if (reminder) {
      const targetDate = targetDateStr ? new Date(targetDateStr) : undefined;
      reminder.resume(targetDate);
      await this.repository.save(reminder);
      console.log(
        `[InMemoryReminderScheduler] Rescheduled reminder for ${commitmentId}`,
      );
    } else {
      console.warn(
        `[InMemoryReminderScheduler] Cannot reschedule unknown reminder for ${commitmentId}`,
      );
    }
  }

  public async cancel(commitmentId: string): Promise<void> {
    const reminder = await this.repository.findByCommitmentId(commitmentId);
    if (reminder) {
      reminder.cancel();
      await this.repository.save(reminder);
      console.log(
        `[InMemoryReminderScheduler] Cancelled reminder for ${commitmentId}`,
      );
    }
  }

  // Exposed for testing
  public async isScheduled(commitmentId: string): Promise<boolean> {
    const reminder = await this.repository.findByCommitmentId(commitmentId);
    return reminder?.status === ReminderStatus.Scheduled;
  }

  public async isSuspended(commitmentId: string): Promise<boolean> {
    const reminder = await this.repository.findByCommitmentId(commitmentId);
    return reminder?.status === ReminderStatus.Suspended;
  }
}
