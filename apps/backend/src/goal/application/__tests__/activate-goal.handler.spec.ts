import {
  ActivateGoalCommandHandlerCore,
  GoalNotFoundError,
  GoalStateConflictError,
} from '../commands/activate-goal.handler';
import { ActivateGoalCommand } from '../commands/activate-goal.command';
import { ArchiveGoalCommandHandlerCore } from '../commands/archive-goal.handler';
import { ArchiveGoalCommand } from '../commands/archive-goal.command';
import { LinkCommitmentToGoalCommandHandlerCore } from '../commands/link-commitment-to-goal.handler';
import { LinkCommitmentToGoalCommand } from '../commands/link-commitment-to-goal.command';
import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { DomainEvent } from '@commitment/domain';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

describe('ActivateGoalCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let dispatchedEvents: DomainEvent[];
  let registerHandler: RegisterGoalCommandHandlerCore;
  let linkHandler: LinkCommitmentToGoalCommandHandlerCore;
  let activateHandler: ActivateGoalCommandHandlerCore;
  let archiveHandler: ArchiveGoalCommandHandlerCore;

  const id = '018f6b5c-42e1-7000-8000-999999999999';
  const identityId = '018f6b5c-42e1-7000-8000-111111111111';
  const commitmentId = '018f6b5c-42e1-7000-8000-222222222222';

  beforeEach(() => {
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
    linkHandler = new LinkCommitmentToGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    activateHandler = new ActivateGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    archiveHandler = new ArchiveGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  });

  it('should activate a Draft goal that has a description and a linked Commitment', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(
        id,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );
    await linkHandler.handle(new LinkCommitmentToGoalCommand(id, commitmentId));
    dispatchedEvents = [];

    const result = await activateHandler.handle(new ActivateGoalCommand(id));

    expect(result.goalId).toBe(id);
    expect(result.state).toBe('Active');
    expect(result.version).toBe(3);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.activated');

    const history = await eventStore.getEvents(id);
    expect(history.map((e) => e.name)).toEqual([
      'goal.registered',
      'goal.commitment_linked',
      'goal.activated',
    ]);
  });

  it('should activate idempotently when already active', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(
        id,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );
    await linkHandler.handle(new LinkCommitmentToGoalCommand(id, commitmentId));
    await activateHandler.handle(new ActivateGoalCommand(id));
    dispatchedEvents = [];

    const result = await activateHandler.handle(new ActivateGoalCommand(id));

    expect(result.state).toBe('Active');
    expect(result.version).toBe(3); // unchanged
    expect(dispatchedEvents).toHaveLength(0);
  });

  it('should throw GoalNotFoundError for an unknown goal id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await expect(
      activateHandler.handle(new ActivateGoalCommand(unknownId)),
    ).rejects.toThrow(GoalNotFoundError);
  });

  it('should reject activation without a description', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(id, identityId, 'Run a half marathon'),
    );
    await linkHandler.handle(new LinkCommitmentToGoalCommand(id, commitmentId));

    await expect(
      activateHandler.handle(new ActivateGoalCommand(id)),
    ).rejects.toThrow(GoalStateConflictError);
  });

  it('should reject activation without at least one linked Commitment', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(
        id,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );

    await expect(
      activateHandler.handle(new ActivateGoalCommand(id)),
    ).rejects.toThrow(GoalStateConflictError);
  });

  it('should reject activating an archived goal', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(
        id,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );
    await archiveHandler.handle(new ArchiveGoalCommand(id));

    await expect(
      activateHandler.handle(new ActivateGoalCommand(id)),
    ).rejects.toThrow(GoalStateConflictError);
  });
});
