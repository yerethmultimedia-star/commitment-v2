import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommitmentResumedEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(CommitmentResumedEvent)
export class RescheduleReminderOnResumeHandler implements IEventHandler<CommitmentResumedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: CommitmentResumedEvent): Promise<void> {
    const { commitmentId, targetDate } = event.payload;
    await this.scheduler.reschedule(commitmentId, targetDate);
  }
}
