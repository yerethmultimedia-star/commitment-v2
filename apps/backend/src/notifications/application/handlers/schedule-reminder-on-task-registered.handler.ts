import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TaskRegisteredEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

/**
 * Mirrors ScheduleReminderOnActivationHandler (Commitment) — Task has no
 * recurrence, so it needs no dedicated scheduling service like Habit's.
 * scheduler.schedule() itself no-ops when targetDateStr is undefined, so
 * a task registered without a due date is a safe no-op here.
 */
@EventsHandler(TaskRegisteredEvent)
export class ScheduleReminderOnTaskRegisteredHandler implements IEventHandler<TaskRegisteredEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: TaskRegisteredEvent): Promise<void> {
    const { taskId, identityId, dueDate } = event.payload;
    await this.scheduler.schedule(taskId, 'task', identityId, dueDate);
  }
}
