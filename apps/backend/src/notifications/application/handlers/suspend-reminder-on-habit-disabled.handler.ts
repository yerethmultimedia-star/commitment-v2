import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HabitDisabledEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(HabitDisabledEvent)
export class SuspendReminderOnHabitDisabledHandler implements IEventHandler<HabitDisabledEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: HabitDisabledEvent): Promise<void> {
    await this.scheduler.suspend(event.payload.habitId, 'habit');
  }
}
