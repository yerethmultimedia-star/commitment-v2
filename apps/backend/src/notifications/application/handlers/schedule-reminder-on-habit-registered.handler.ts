import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HabitRegisteredEvent } from '@commitment/domain';
import { HabitReminderSchedulingService } from '../services/habit-reminder-scheduling.service';

@EventsHandler(HabitRegisteredEvent)
export class ScheduleReminderOnHabitRegisteredHandler implements IEventHandler<HabitRegisteredEvent> {
  constructor(
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  public async handle(event: HabitRegisteredEvent): Promise<void> {
    const after = new Date(event.payload.createdAt);
    await this.habitReminderScheduling.scheduleNext(
      event.payload.habitId,
      after,
    );
  }
}
