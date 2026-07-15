import { Injectable, Inject, Logger } from '@nestjs/common';
import { computeNextOccurrence, HabitRecurrenceType } from '@commitment/domain';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';
import { InMemoryHabitProjectionStore } from '../../../habit/infrastructure/in-memory-habit-projection.store';

/**
 * Shared by every Habit-related notification handler that needs to arm the
 * next reminder. Looks the habit up in its projection (the notifications
 * module has no business reading the Habit aggregate directly) to get the
 * recurrence/reminderTime/anchorDate needed to compute where "next" is.
 */
@Injectable()
export class HabitReminderSchedulingService {
  private readonly logger = new Logger(HabitReminderSchedulingService.name);

  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
    @Inject('HabitProjectionStore')
    private readonly habitProjectionStore: InMemoryHabitProjectionStore,
  ) {}

  /** Computes and (re)schedules the habit's next due reminder, strictly after `after`. */
  public async scheduleNext(habitId: string, after: Date): Promise<void> {
    const habit = this.habitProjectionStore.findById(habitId);
    if (!habit) {
      this.logger.warn(
        `Cannot schedule next occurrence — habit ${habitId} not found in projection`,
      );
      return;
    }

    const recurrence = {
      type: habit.recurrenceType as HabitRecurrenceType,
      daysOfWeek: habit.daysOfWeek,
      dayOfMonth: habit.dayOfMonth,
      month: habit.month,
    };
    const reminderTime = {
      hour: habit.reminderHour,
      minute: habit.reminderMinute,
    };
    const anchorDate = new Date(habit.recurrenceAnchorDate);

    const next = computeNextOccurrence(
      recurrence,
      reminderTime,
      anchorDate,
      after,
    );
    await this.scheduler.schedule(
      habitId,
      'habit',
      habit.identityId,
      next.toISOString(),
    );
  }

  /** Schedules the reminder at an explicit moment (used by postpone, which already knows the target time). */
  public async scheduleAt(habitId: string, targetISO: string): Promise<void> {
    const habit = this.habitProjectionStore.findById(habitId);
    if (!habit) {
      this.logger.warn(
        `Cannot schedule reminder — habit ${habitId} not found in projection`,
      );
      return;
    }
    await this.scheduler.schedule(
      habitId,
      'habit',
      habit.identityId,
      targetISO,
    );
  }
}
