import {
  CompleteGoalCommandHandlerCore,
  GoalNotFoundError,
} from '../commands/complete-goal.handler';
import { CompleteGoalCommand } from '../commands/complete-goal.command';
import { ArchiveGoalCommandHandlerCore } from '../commands/archive-goal.handler';
import { ArchiveGoalCommand } from '../commands/archive-goal.command';
import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { DomainEvent } from '@commitment/domain';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

describe('CompleteGoalCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let dispatchedEvents: DomainEvent[];
  let registerHandler: RegisterGoalCommandHandlerCore;
  let completeHandler: CompleteGoalCommandHandlerCore;
  let archiveHandler: ArchiveGoalCommandHandlerCore;

  const id = '018f6b5c-42e1-7000-8000-999999999999';
  const identityId = '018f6b5c-42e1-7000-8000-111111111111';

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
    completeHandler = new CompleteGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    archiveHandler = new ArchiveGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );

    await registerHandler.handle(
      new RegisterGoalCommand(id, identityId, 'Run a half marathon'),
    );
    dispatchedEvents = [];
  });

  it('should complete a goal and dispatch goal.completed', async () => {
    const result = await completeHandler.handle(new CompleteGoalCommand(id));

    expect(result.goalId).toBe(id);
    expect(result.state).toBe('Completed');
    expect(result.version).toBe(2);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.completed');

    // registered (v1) + completed (v2) — both durably logged
    const history = await eventStore.getEvents(id);
    expect(history.map((e) => e.name)).toEqual([
      'goal.registered',
      'goal.completed',
    ]);
  });

  it('should complete idempotently when already completed', async () => {
    await completeHandler.handle(new CompleteGoalCommand(id));
    dispatchedEvents = [];

    const result = await completeHandler.handle(new CompleteGoalCommand(id));

    expect(result.state).toBe('Completed');
    expect(result.version).toBe(2); // unchanged
    expect(dispatchedEvents).toHaveLength(0);
  });

  it('should throw GoalNotFoundError for an unknown goal id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await expect(
      completeHandler.handle(new CompleteGoalCommand(unknownId)),
    ).rejects.toThrow(GoalNotFoundError);
  });

  it('should reject completing an archived goal', async () => {
    await archiveHandler.handle(new ArchiveGoalCommand(id));

    await expect(
      completeHandler.handle(new CompleteGoalCommand(id)),
    ).rejects.toThrow();
  });
});
