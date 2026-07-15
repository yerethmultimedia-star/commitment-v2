import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HabitPostponedEvent } from '@commitment/domain';
import { HabitReminderSchedulingService } from '../services/habit-reminder-scheduling.service';

@EventsHandler(HabitPostponedEvent)
export class RescheduleReminderOnHabitPostponedHandler implements IEventHandler<HabitPostponedEvent> {
  constructor(
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  public async handle(event: HabitPostponedEvent): Promise<void> {
    await this.habitReminderScheduling.scheduleAt(
      event.payload.habitId,
      event.payload.postponedUntil,
    );
  }
}
