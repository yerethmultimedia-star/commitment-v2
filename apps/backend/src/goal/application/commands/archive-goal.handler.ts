import { GoalId, GoalState } from '@commitment/domain';
import { ArchiveGoalCommand } from './archive-goal.command';
import { ArchiveGoalResult } from './archive-goal.result';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import type { VersionedGoalRepository } from '../ports/versioned-goal-repository.port';

export class GoalNotFoundError extends Error {
  constructor(id: string) {
    super(`Goal not found: ${id}`);
    this.name = 'GoalNotFoundError';
  }
}

export class ArchiveGoalCommandHandlerCore {
  constructor(
    private readonly goalRepository: VersionedGoalRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: ArchiveGoalCommand): Promise<ArchiveGoalResult> {
    const id = new GoalId(command.goalId);

    // 1. Load aggregate — 404 if not found
    const goal = await this.goalRepository.findById(id);
    if (!goal) {
      throw new GoalNotFoundError(command.goalId);
    }

    // 2. Invoke domain behavior — Goal.archive() is idempotent and allowed from any state
    goal.archive();

    // 3. Persist — version unchanged if already Archived (Rule #87)
    const version = await this.goalRepository.save(goal);

    // 4. Dispatch events and clear buffer
    const events = goal.getUncommittedEvents();
    await this.eventDispatcher.dispatch(events);
    goal.clearUncommittedEvents();

    return new ArchiveGoalResult(goal.id.value, GoalState[goal.state], version);
  }
}
