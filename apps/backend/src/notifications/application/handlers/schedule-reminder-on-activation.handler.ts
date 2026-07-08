import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommitmentActivatedEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(CommitmentActivatedEvent)
export class ScheduleReminderOnActivationHandler implements IEventHandler<CommitmentActivatedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: CommitmentActivatedEvent): Promise<void> {
    await this.scheduler.schedule(event.payload.commitmentId);
  }
}
