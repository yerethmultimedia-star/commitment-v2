import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TaskDueDateChangedEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

/**
 * Fires on every Task.schedule() call (Story 3's ScheduleTaskCommand, and
 * task creation with a due date). Uses scheduler.schedule() rather than
 * .reschedule() deliberately: a task can acquire its first due date well
 * after registration (it may have had none at creation, so
 * ScheduleReminderOnTaskRegisteredHandler never created a reminder for it)
 * — .reschedule() no-ops on a missing reminder, .schedule() creates one if
 * missing or updates it if not, covering both cases correctly.
 */
@EventsHandler(TaskDueDateChangedEvent)
export class RescheduleReminderOnTaskDueDateChangedHandler implements IEventHandler<TaskDueDateChangedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: TaskDueDateChangedEvent): Promise<void> {
    const { taskId, identityId, dueDate } = event.payload;
    if (dueDate) {
      await this.scheduler.schedule(taskId, 'task', identityId, dueDate);
    } else {
      await this.scheduler.cancel(taskId, 'task');
    }
  }
}
