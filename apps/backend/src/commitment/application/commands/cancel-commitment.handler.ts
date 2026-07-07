import {
  CommitmentId,
  CommitmentAlreadyCompletedError,
} from '@commitment/domain';
import { CancelCommitmentCommand } from './cancel-commitment.command';
import { CancelCommitmentResult } from './cancel-commitment.result';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';

export class CommitmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Commitment not found: ${id}`);
    this.name = 'CommitmentNotFoundError';
  }
}

export class CommitmentStateConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentStateConflictError';
  }
}

export class CancelCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: CancelCommitmentCommand,
  ): Promise<CancelCommitmentResult> {
    const id = new CommitmentId(command.commitmentId);

    // 1. Load aggregate
    const commitment = await this.commitmentRepository.findById(id);
    if (!commitment) {
      throw new CommitmentNotFoundError(command.commitmentId);
    }

    // 2. Invoke domain behavior – let the Aggregate decide idempotency and business rules
    try {
      commitment.cancel();
    } catch (error: unknown) {
      if (error instanceof CommitmentAlreadyCompletedError) {
        throw new CommitmentStateConflictError(error.message);
      }
      throw error;
    }

    // 3. Persist – version is returned by repository
    const version = await this.commitmentRepository.save(commitment);

    // 4. Dispatch events and clear buffer
    const events = commitment.getUncommittedEvents();
    if (events.length > 0) {
      await this.eventDispatcher.dispatch(events);
      commitment.clearUncommittedEvents();
    }

    // 5. Return DTO built from aggregate
    return new CancelCommitmentResult(
      commitment.id.value,
      'Cancelled',
      version,
    );
  }
}
