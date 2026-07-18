import {
  GoalId,
  GoalTitle,
  GoalDescription,
  Goal,
  IdentityId,
  type EventStore,
} from '@commitment/domain';
import { RegisterGoalCommand } from './register-goal.command';
import { RegisterGoalResult } from './register-goal.result';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import type { VersionedGoalRepository } from '../ports/versioned-goal-repository.port';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export class RegisterGoalCommandHandlerCore {
  constructor(
    private readonly goalRepository: VersionedGoalRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
    private readonly eventStore: EventStore,
    @InjectMetric('goals_created_total')
    private readonly goalsCounter?: Counter<string>,
  ) {}

  public async handle(
    command: RegisterGoalCommand,
  ): Promise<RegisterGoalResult> {
    // 1. Idempotency Check
    const id = new GoalId(command.id);
    const existing = await this.goalRepository.findById(id);
    if (existing) {
      // Return existing details idempotently — version does NOT increment (Rule #87)
      const version = await this.goalRepository.save(existing);
      return new RegisterGoalResult(existing.id.value, version);
    }

    // 2. Translate Primitives into Domain Value Objects
    const identityId = new IdentityId(command.identityId);
    const title = new GoalTitle(command.title);
    const description = command.description
      ? new GoalDescription(command.description)
      : null;

    // 3. Invoke Domain Aggregate Behavior
    const goal: Goal = Goal.register(id, identityId, title, description);

    // 4. Save to Repository — receive actual version
    const version = await this.goalRepository.save(goal);

    // 5. Durable event log (ADR-021) — additive, does not affect step 4's source of truth
    const events = goal.getUncommittedEvents();
    if (events.length > 0) {
      await this.eventStore.saveEvents(
        goal.id.value,
        version - events.length,
        events,
      );
    }

    // 6. Dispatch Primary Events & Clear Event Buffer
    await this.eventDispatcher.dispatch(events);
    goal.clearUncommittedEvents();

    if (this.goalsCounter) {
      this.goalsCounter.inc();
    }

    return new RegisterGoalResult(goal.id.value, version);
  }
}
