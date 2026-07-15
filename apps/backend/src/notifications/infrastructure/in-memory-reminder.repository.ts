import { Injectable } from '@nestjs/common';
import {
  Reminder,
  ReminderStatus,
  ReminderSourceType,
} from '@commitment/domain';
import { ReminderRepository } from '../application/ports/reminder.repository.port';

@Injectable()
export class InMemoryReminderRepository implements ReminderRepository {
  private readonly reminders = new Map<string, Reminder>();

  public async save(reminder: Reminder): Promise<void> {
    await Promise.resolve();
    this.reminders.set(reminder.id, reminder);
  }

  public async findBySourceId(
    sourceId: string,
    sourceType: ReminderSourceType,
  ): Promise<Reminder | null> {
    await Promise.resolve();
    for (const reminder of this.reminders.values()) {
      if (
        reminder.sourceId === sourceId &&
        reminder.sourceType === sourceType
      ) {
        return reminder;
      }
    }
    return null;
  }

  public async findById(id: string): Promise<Reminder | null> {
    await Promise.resolve();
    return this.reminders.get(id) || null;
  }

  public async findReady(now: Date): Promise<Reminder[]> {
    await Promise.resolve();
    const ready: Reminder[] = [];
    for (const reminder of this.reminders.values()) {
      if (
        reminder.status === ReminderStatus.Scheduled &&
        reminder.scheduledFor.getTime() <= now.getTime()
      ) {
        ready.push(reminder);
      }
    }
    return ready;
  }
}
