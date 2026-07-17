import {
  GoalId,
  GoalTitle,
  GoalAlreadyCompletedError,
  GoalAlreadyArchivedError,
} from '@commitment/domain';
import { RenameGoalCommand } from './rename-goal.command';
import { RenameGoalResult } from './rename-goal.result';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import type { VersionedGoalRepository } from '../ports/versioned-goal-repository.port';

// Application-layer exceptions (framework-agnostic)
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

export class RenameGoalCommandHandlerCore {
  constructor(
    private readonly goalRepository: VersionedGoalRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: RenameGoalCommand): Promise<RenameGoalResult> {
    const id = new GoalId(command.goalId);

    // 1. Load aggregate — 404 if not found
    const goal = await this.goalRepository.findById(id);
    if (!goal) {
      throw new GoalNotFoundError(command.goalId);
    }

    // 2. Invoke domain behavior — let the Aggregate decide validity
    const title = new GoalTitle(command.title);
    try {
      goal.rename(title);
    } catch (error: unknown) {
      if (
        error instanceof GoalAlreadyCompletedError ||
        error instanceof GoalAlreadyArchivedError
      ) {
        throw new GoalStateConflictError(
          error instanceof Error ? error.message : 'Goal is immutable',
        );
      }
      throw error;
    }

    // 3. Persist — version is returned by repository (unchanged if rename was a no-op, Rule #77/#87)
    const version = await this.goalRepository.save(goal);

    // 4. Dispatch events and clear buffer
    const events = goal.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    goal.clearUncommittedEvents();

    return new RenameGoalResult(goal.id.value, goal.title.value, version);
  }
}
