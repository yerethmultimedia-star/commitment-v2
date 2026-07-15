import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommitmentPausedEvent } from '@commitment/domain';
import { Inject } from '@nestjs/common';
import type { ReminderSchedulerPort } from '../ports/reminder-scheduler.port';

@EventsHandler(CommitmentPausedEvent)
export class SuspendReminderOnPauseHandler implements IEventHandler<CommitmentPausedEvent> {
  constructor(
    @Inject('ReminderSchedulerPort')
    private readonly scheduler: ReminderSchedulerPort,
  ) {}

  public async handle(event: CommitmentPausedEvent): Promise<void> {
    await this.scheduler.suspend(event.payload.commitmentId, 'commitment');
  }
}
