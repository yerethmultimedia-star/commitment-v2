import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  HabitCompletedEvent,
  HabitOccurrenceMissedEvent,
} from '@commitment/domain';
import { HabitReminderSchedulingService } from '../services/habit-reminder-scheduling.service';

/**
 * Both completion and a missed occurrence "use up" today's reminder and
 * must arm the next one — they only differ in whether the streak advances
 * or resets (handled inside the Habit aggregate itself).
 */
@EventsHandler(HabitCompletedEvent)
export class RescheduleReminderOnHabitCompletedHandler implements IEventHandler<HabitCompletedEvent> {
  constructor(
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  public async handle(event: HabitCompletedEvent): Promise<void> {
    const after = new Date(event.metadata.occurredAt);
    await this.habitReminderScheduling.scheduleNext(
      event.payload.habitId,
      after,
    );
  }
}

@EventsHandler(HabitOccurrenceMissedEvent)
export class RescheduleReminderOnHabitMissedHandler implements IEventHandler<HabitOccurrenceMissedEvent> {
  constructor(
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  public async handle(event: HabitOccurrenceMissedEvent): Promise<void> {
    const after = new Date(event.metadata.occurredAt);
    await this.habitReminderScheduling.scheduleNext(
      event.payload.habitId,
      after,
    );
  }
}
