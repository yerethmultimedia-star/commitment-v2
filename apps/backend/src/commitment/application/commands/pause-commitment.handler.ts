import {
  CommitmentId,
  CommitmentAlreadyCompletedError,
  CommitmentAlreadyCancelledError,
  CommitmentCannotBePausedError,
} from '@commitment/domain';
import { PauseCommitmentCommand } from './pause-commitment.command';
import { PauseCommitmentResult } from '../results/pause-commitment.result';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';

// Application-layer exceptions (framework‑agnostic)
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

export class CommitmentStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentStateTransitionError';
  }
}

export class PauseCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: PauseCommitmentCommand,
  ): Promise<PauseCommitmentResult> {
    const id = new CommitmentId(command.commitmentId);

    // 1. Load aggregate – 404 if not found
    const commitment = await this.commitmentRepository.findById(id);
    if (!commitment) {
      throw new CommitmentNotFoundError(command.commitmentId);
    }

    // 2. Invoke domain behavior – let the Aggregate decide validity.
    // Idempotency (already Paused) is the aggregate's own responsibility
    // (Rule #77) — no handler-level pre-check (TD-003).
    try {
      commitment.pause();
    } catch (error: unknown) {
      if (
        error instanceof CommitmentAlreadyCompletedError ||
        error instanceof CommitmentAlreadyCancelledError
      ) {
        throw new CommitmentStateConflictError(
          error instanceof Error
            ? error.message
            : 'Commitment is in a terminal state',
        );
      }
      if (error instanceof CommitmentCannotBePausedError) {
        throw new CommitmentStateTransitionError(
          error instanceof Error ? error.message : 'Invalid state transition',
        );
      }
      throw error;
    }

    // 3. Persist – version is returned by repository
    const version = await this.commitmentRepository.save(commitment);

    // 4. Dispatch events and clear buffer
    const events = commitment.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    commitment.clearUncommittedEvents();

    // 5. Return DTO built from aggregate (source of truth)
    return new PauseCommitmentResult(commitment.id.value, 'Paused', version);
  }
}
