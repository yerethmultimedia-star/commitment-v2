import {
  GoalId,
  GoalState,
  GoalAlreadyArchivedError,
  InvalidGoalStateTransitionError,
} from '@commitment/domain';
import { CompleteGoalCommand } from './complete-goal.command';
import { CompleteGoalResult } from './complete-goal.result';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import type { VersionedGoalRepository } from '../ports/versioned-goal-repository.port';

export class GoalNotFoundError extends Error {
  constructor(id: string) {
    super(`Goal not found: ${id}`);
    this.name = 'GoalNotFoundError';
  }
}

export class GoalStateConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoalStateConflictError';
  }
}

export class CompleteGoalCommandHandlerCore {
  constructor(
    private readonly goalRepository: VersionedGoalRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: CompleteGoalCommand,
  ): Promise<CompleteGoalResult> {
    const id = new GoalId(command.goalId);

    // 1. Load aggregate — 404 if not found
    const goal = await this.goalRepository.findById(id);
    if (!goal) {
      throw new GoalNotFoundError(command.goalId);
    }

    // 2. Invoke domain behavior — Goal.complete() is idempotent when already Completed
    try {
      goal.complete();
    } catch (error: unknown) {
      if (
        error instanceof GoalAlreadyArchivedError ||
        error instanceof InvalidGoalStateTransitionError
      ) {
        throw new GoalStateConflictError(
          error instanceof Error ? error.message : 'Goal is immutable',
        );
      }
      throw error;
    }

    // 3. Persist — version unchanged if the transition was idempotent (Rule #87)
    const version = await this.goalRepository.save(goal);

    // 4. Dispatch events and clear buffer
    const events = goal.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    goal.clearUncommittedEvents();

    return new CompleteGoalResult(
      goal.id.value,
      GoalState[goal.state],
      version,
    );
  }
}
