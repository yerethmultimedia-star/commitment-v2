import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { HabitArchivedEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(HabitArchivedEvent)
export class CancelReminderOnHabitArchivedHandler implements IEventHandler<HabitArchivedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: HabitArchivedEvent): Promise<void> {
    await this.scheduler.cancel(event.payload.habitId, 'habit');
  }
}
