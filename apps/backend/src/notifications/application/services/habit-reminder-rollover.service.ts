import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderStatus, HabitState } from '@commitment/domain';
import type { ReminderRepository } from '../ports/reminder.repository.port';
import { InMemoryHabitProjectionStore } from '../../../habit/infrastructure/in-memory-habit-projection.store';
import { HabitReminderSchedulingService } from './habit-reminder-scheduling.service';

/**
 * Safety net for Habit reminders. The normal path reschedules the next
 * occurrence whenever the Habit aggregate itself changes (completed,
 * missed, enabled) — but a reminder firing does NOT touch the Habit
 * aggregate (only ReminderWorkerService.process does, which just marks
 * the Reminder complete and sends the push). If the user never opens the
 * app to act on it, no Habit event ever fires and nothing would otherwise
 * re-arm tomorrow's reminder. This hourly sweep re-arms any active habit
 * whose reminder isn't currently Scheduled — a housekeeping cron at the
 * same tier as ReminderDispatcher's per-minute sweep, not a second
 * scheduling paradigm (no BullMQ `repeat` involved).
 */
@Injectable()
export class HabitReminderRolloverService {
  private readonly logger = new Logger(HabitReminderRolloverService.name);

  constructor(
    @Inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository,
    @Inject('HabitProjectionStore')
    private readonly habitProjectionStore: InMemoryHabitProjectionStore,
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async rearmStalledHabitReminders(): Promise<void> {
    const now = new Date();
    const activeHabits = this.habitProjectionStore
      .findAll()
      .filter((h) => h.state === (HabitState.Active as string));

    for (const habit of activeHabits) {
      const reminder = await this.reminderRepository.findBySourceId(
        habit.id,
        'habit',
      );
      if (reminder && reminder.status === ReminderStatus.Scheduled) continue; // already armed

      try {
        await this.habitReminderScheduling.scheduleNext(habit.id, now);
      } catch (error) {
        this.logger.error(
          `Failed to re-arm reminder for habit ${habit.id}`,
          error,
        );
      }
    }
  }
}
