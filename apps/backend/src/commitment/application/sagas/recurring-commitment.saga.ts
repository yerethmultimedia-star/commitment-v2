import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { CommitmentCompletedEvent } from '@commitment/domain';
import { RegisterCommitmentCommand } from '../commands/register-commitment.command';
import { NextOccurrenceCalculator } from '../services/next-occurrence.calculator';
import { randomUUID } from 'crypto';

@EventsHandler(CommitmentCompletedEvent)
export class RecurringCommitmentSaga implements IEventHandler<CommitmentCompletedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  public async handle(event: CommitmentCompletedEvent): Promise<void> {
    const payload = event.payload;

    if (!payload.recurrencePattern || payload.recurrencePattern === 'None') {
      return;
    }

    const nextDate = NextOccurrenceCalculator.calculate(
      payload.recurrencePattern,
      payload.targetDate,
    );

    // If we cannot calculate a next date (e.g. invalid current date or missing), we abort.
    if (!nextDate) {
      return;
    }

    const nextCommitmentId = randomUUID();

    const command = new RegisterCommitmentCommand(
      nextCommitmentId,
      payload.identityId,
      payload.title,
      payload.description,
      payload.recurrencePattern,
      nextDate.toISOString(),
      payload.seriesId,
    );

    await this.commandBus.execute(command);
  }
}
