import {
  GoalId,
  GoalAlreadyCompletedError,
  GoalAlreadyArchivedError,
  type EventStore,
} from '@commitment/domain';
import { LinkHabitToGoalCommand } from './link-habit-to-goal.command';
import { LinkHabitToGoalResult } from './link-habit-to-goal.result';
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

export class LinkHabitToGoalCommandHandlerCore {
  constructor(
    private readonly goalRepository: VersionedGoalRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
    private readonly eventStore: EventStore,
  ) {}

  public async handle(
    command: LinkHabitToGoalCommand,
  ): Promise<LinkHabitToGoalResult> {
    const id = new GoalId(command.goalId);

    // 1. Load aggregate — 404 if not found
    const goal = await this.goalRepository.findById(id);
    if (!goal) {
      throw new GoalNotFoundError(command.goalId);
    }

    // 2. Invoke domain behavior — Goal.linkHabit() is idempotent when
    // already linked; rejects Completed/Archived goals (ensureNotImmutable).
    // habitId is a plain string — Habit has no domain aggregate yet.
    try {
      goal.linkHabit(command.habitId);
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

    // 3. Persist — version unchanged if the link was already present (Rule #87)
    const version = await this.goalRepository.save(goal);

    // 4. Durable event log (ADR-021) — additive, does not affect step 3's source of truth
    const events = goal.getUncommittedEvents();
    if (events.length > 0) {
      await this.eventStore.saveEvents(
        goal.id.value,
        version - events.length,
        events,
      );
    }

    // 5. Dispatch events and clear buffer
    await this.eventDispatcher.dispatch(events);
    goal.clearUncommittedEvents();

    return new LinkHabitToGoalResult(goal.id.value, goal.habitIds, version);
  }
}
