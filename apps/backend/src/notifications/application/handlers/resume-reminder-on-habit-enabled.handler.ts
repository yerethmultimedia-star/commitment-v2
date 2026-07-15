import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HabitEnabledEvent } from '@commitment/domain';
import { HabitReminderSchedulingService } from '../services/habit-reminder-scheduling.service';

@EventsHandler(HabitEnabledEvent)
export class ResumeReminderOnHabitEnabledHandler implements IEventHandler<HabitEnabledEvent> {
  constructor(
    private readonly habitReminderScheduling: HabitReminderSchedulingService,
  ) {}

  public async handle(event: HabitEnabledEvent): Promise<void> {
    const after = new Date(event.metadata.occurredAt);
    await this.habitReminderScheduling.scheduleNext(
      event.payload.habitId,
      after,
    );
  }
}
