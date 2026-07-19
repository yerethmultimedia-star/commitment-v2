import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TaskCompletedEvent, TaskCancelledEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

/** Mirrors CancelReminderOnCompletedHandler/CancelReminderOnCancelledHandler (Commitment). */
@EventsHandler(TaskCompletedEvent)
export class CancelReminderOnTaskCompletedHandler implements IEventHandler<TaskCompletedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: TaskCompletedEvent): Promise<void> {
    await this.scheduler.cancel(event.payload.taskId, 'task');
  }
}

@EventsHandler(TaskCancelledEvent)
export class CancelReminderOnTaskCancelledHandler implements IEventHandler<TaskCancelledEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: TaskCancelledEvent): Promise<void> {
    await this.scheduler.cancel(event.payload.taskId, 'task');
  }
}
