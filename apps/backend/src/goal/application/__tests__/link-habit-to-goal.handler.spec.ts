import {
  LinkHabitToGoalCommandHandlerCore,
  GoalNotFoundError,
} from '../commands/link-habit-to-goal.handler';
import { LinkHabitToGoalCommand } from '../commands/link-habit-to-goal.command';
import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { ArchiveGoalCommandHandlerCore } from '../commands/archive-goal.handler';
import { ArchiveGoalCommand } from '../commands/archive-goal.command';
import { CompleteGoalCommandHandlerCore } from '../commands/complete-goal.handler';
import { CompleteGoalCommand } from '../commands/complete-goal.command';
import { DomainEvent } from '@commitment/domain';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

describe('LinkHabitToGoalCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let dispatchedEvents: DomainEvent[];
  let registerHandler: RegisterGoalCommandHandlerCore;
  let linkHandler: LinkHabitToGoalCommandHandlerCore;
  let archiveHandler: ArchiveGoalCommandHandlerCore;
  let completeHandler: CompleteGoalCommandHandlerCore;

  const goalId = '018f6b5c-42e1-7000-8000-999999999999';
  const identityId = '018f6b5c-42e1-7000-8000-111111111111';
  const habitId = '018f6b5c-42e1-7000-8000-444444444444';

  beforeEach(async () => {
    repository = new InMemoryGoalRepository();
    eventStore = new InMemoryEventStore();
    dispatchedEvents = [];
    dispatcher = {
      dispatch: (events) => {
        dispatchedEvents.push(...events);
        return Promise.resolve();
      },
    };

    registerHandler = new RegisterGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    linkHandler = new LinkHabitToGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    archiveHandler = new ArchiveGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    completeHandler = new CompleteGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );

    await registerHandler.handle(
      new RegisterGoalCommand(goalId, identityId, 'Run a half marathon'),
    );
    dispatchedEvents = [];
  });

  it('should link a habit and dispatch goal.habit_linked', async () => {
    const result = await linkHandler.handle(
      new LinkHabitToGoalCommand(goalId, habitId),
    );

    expect(result.habitIds).toEqual([habitId]);
    expect(result.version).toBe(2);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.habit_linked');
  });

  it('should not change state when linking the same habit twice', async () => {
    await linkHandler.handle(new LinkHabitToGoalCommand(goalId, habitId));
    dispatchedEvents = [];

    const result = await linkHandler.handle(
      new LinkHabitToGoalCommand(goalId, habitId),
    );

    expect(result.habitIds).toEqual([habitId]); // no duplicate
    expect(result.version).toBe(2); // unchanged — no new event
    expect(dispatchedEvents).toHaveLength(0);
  });

  it('should throw GoalNotFoundError for an unknown goal id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await expect(
      linkHandler.handle(new LinkHabitToGoalCommand(unknownId, habitId)),
    ).rejects.toThrow(GoalNotFoundError);
  });

  it('should reject linking a habit to an archived goal', async () => {
    await archiveHandler.handle(new ArchiveGoalCommand(goalId));

    await expect(
      linkHandler.handle(new LinkHabitToGoalCommand(goalId, habitId)),
    ).rejects.toThrow();
  });

  it('should reject linking a habit to a completed goal', async () => {
    await completeHandler.handle(new CompleteGoalCommand(goalId));

    await expect(
      linkHandler.handle(new LinkHabitToGoalCommand(goalId, habitId)),
    ).rejects.toThrow();
  });
});
