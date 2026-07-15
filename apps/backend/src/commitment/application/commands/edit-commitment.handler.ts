import {
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
  CommitmentPriority,
  PriorityType,
  RecurrencePattern,
  RecurrenceType,
  TargetDate,
} from '@commitment/domain';
import { EditCommitmentCommand } from './edit-commitment.command';
import { EditCommitmentResult } from './edit-commitment.result';
import type { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import type { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';

export class CommitmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Commitment with ID ${id} not found`);
    this.name = 'CommitmentNotFoundError';
  }
}

export class EditCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: EditCommitmentCommand,
  ): Promise<EditCommitmentResult> {
    const id = new CommitmentId(command.commitmentId);
    const commitment = await this.commitmentRepository.findById(id);

    if (!commitment) {
      throw new CommitmentNotFoundError(command.commitmentId);
    }

    const title = command.title
      ? new CommitmentTitle(command.title)
      : undefined;

    let description: CommitmentDescription | null | undefined = undefined;
    if (command.description !== undefined) {
      description = command.description
        ? new CommitmentDescription(command.description)
        : null;
    }

    let recurrencePattern: RecurrencePattern | undefined = undefined;
    if (command.recurrencePattern !== undefined) {
      recurrencePattern = RecurrencePattern.create(
        command.recurrencePattern as RecurrenceType,
      );
    }

    let targetDate: TargetDate | null | undefined = undefined;
    if (command.targetDate !== undefined) {
      targetDate = command.targetDate
        ? TargetDate.create(command.targetDate)
        : null;
    }

    commitment.edit(title, description, recurrencePattern, targetDate);

    if (command.priority !== undefined) {
      commitment.changePriority(
        new CommitmentPriority(command.priority as PriorityType),
      );
    }

    const version = await this.commitmentRepository.save(commitment);

    const events = commitment.getUncommittedEvents();
    if (events.length > 0) {
      await this.eventDispatcher.dispatch(events);
      commitment.clearUncommittedEvents();
    }

    return new EditCommitmentResult(commitment.id.value, version);
  }
}
