import {
  CommitmentId,
  CommitmentState,
  CommitmentAlreadyActiveError,
  CommitmentAlreadyCompletedError,
  CommitmentAlreadyCancelledError,
  InvalidCommitmentStateTransitionError,
} from '@commitment/domain';
import { ActivateCommitmentCommand } from './activate-commitment.command';
import { ActivateCommitmentResult } from './activate-commitment.result';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';

// Application-layer exceptions (framework-agnostic)
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

export class ActivateCommitmentCommandHandlerCore {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: ActivateCommitmentCommand,
  ): Promise<ActivateCommitmentResult> {
    const id = new CommitmentId(command.commitmentId);

    // 1. Load aggregate — 404 if not found
    const commitment = await this.commitmentRepository.findById(id);
    if (!commitment) {
      throw new CommitmentNotFoundError(command.commitmentId);
    }

    // 2. Idempotency — already Active: return current state (Rule #77, Rule #87)
    if (commitment.state === CommitmentState.Active) {
      const currentVersion = await this.commitmentRepository.save(commitment);
      return new ActivateCommitmentResult(
        commitment.id.value,
        'Active',
        currentVersion,
      );
    }

    // 3. Invoke domain behavior — let the Aggregate decide validity (Rule #86)
    try {
      commitment.activate();
    } catch (error: unknown) {
      if (error instanceof CommitmentAlreadyActiveError) {
        // Defensive: already handled above, but guard just in case
        const version = await this.commitmentRepository.save(commitment);
        return new ActivateCommitmentResult(
          commitment.id.value,
          'Active',
          version,
        );
      }
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
      if (error instanceof InvalidCommitmentStateTransitionError) {
        throw new CommitmentStateTransitionError(
          error instanceof Error ? error.message : 'Invalid state transition',
        );
      }
      throw error;
    }

    // 4. Persist (Rule #85 — Repository Implements Persistence Only)
    const version = await this.commitmentRepository.save(commitment);

    // 5. Dispatch primary event and clear buffer
    const events = commitment.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    commitment.clearUncommittedEvents();

    return new ActivateCommitmentResult(commitment.id.value, 'Active', version);
  }
}
