import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  CommitmentCompletedEvent,
  CommitmentCancelledEvent,
} from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(CommitmentCompletedEvent)
export class CancelReminderOnCompletedHandler implements IEventHandler<CommitmentCompletedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: CommitmentCompletedEvent): Promise<void> {
    await this.scheduler.cancel(event.payload.commitmentId);
  }
}

@EventsHandler(CommitmentCancelledEvent)
export class CancelReminderOnCancelledHandler implements IEventHandler<CommitmentCancelledEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: CommitmentCancelledEvent): Promise<void> {
    await this.scheduler.cancel(event.payload.commitmentId);
  }
}
