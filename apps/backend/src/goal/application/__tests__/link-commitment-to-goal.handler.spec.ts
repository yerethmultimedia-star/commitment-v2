import {
  LinkCommitmentToGoalCommandHandlerCore,
  GoalNotFoundError,
} from '../commands/link-commitment-to-goal.handler';
import { LinkCommitmentToGoalCommand } from '../commands/link-commitment-to-goal.command';
import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { ArchiveGoalCommandHandlerCore } from '../commands/archive-goal.handler';
import { ArchiveGoalCommand } from '../commands/archive-goal.command';
import { ActivateGoalCommandHandlerCore } from '../commands/activate-goal.handler';
import { ActivateGoalCommand } from '../commands/activate-goal.command';
import { CompleteGoalCommandHandlerCore } from '../commands/complete-goal.handler';
import { CompleteGoalCommand } from '../commands/complete-goal.command';
import { DomainEvent } from '@commitment/domain';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

describe('LinkCommitmentToGoalCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let dispatchedEvents: DomainEvent[];
  let registerHandler: RegisterGoalCommandHandlerCore;
  let linkHandler: LinkCommitmentToGoalCommandHandlerCore;
  let archiveHandler: ArchiveGoalCommandHandlerCore;
  let activateHandler: ActivateGoalCommandHandlerCore;
  let completeHandler: CompleteGoalCommandHandlerCore;

  const goalId = '018f6b5c-42e1-7000-8000-999999999999';
  const identityId = '018f6b5c-42e1-7000-8000-111111111111';
  const commitmentId = '018f6b5c-42e1-7000-8000-222222222222';

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
    linkHandler = new LinkCommitmentToGoalCommandHandlerCore(
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
    activateHandler = new ActivateGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );

    await registerHandler.handle(
      new RegisterGoalCommand(
        goalId,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );
    dispatchedEvents = [];
  });

  it('should link a commitment and dispatch goal.commitment_linked', async () => {
    const result = await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );

    expect(result.commitmentIds).toEqual([commitmentId]);
    expect(result.version).toBe(2);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.commitment_linked');
  });

  it('should not change state when linking the same commitment twice', async () => {
    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );
    dispatchedEvents = [];

    const result = await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );

    expect(result.commitmentIds).toEqual([commitmentId]); // no duplicate
    expect(result.version).toBe(2); // unchanged — no new event
    expect(dispatchedEvents).toHaveLength(0);
  });

  it('should accumulate multiple distinct commitments consistently', async () => {
    const secondCommitmentId = '018f6b5c-42e1-7000-8000-333333333333';

    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );
    const result = await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, secondCommitmentId),
    );

    expect(result.commitmentIds).toEqual([commitmentId, secondCommitmentId]);
    expect(result.version).toBe(3);

    // registered + 2 links — expectedVersion computed correctly across 3 sequential commands
    const history = await eventStore.getEvents(goalId);
    expect(history.map((e) => e.name)).toEqual([
      'goal.registered',
      'goal.commitment_linked',
      'goal.commitment_linked',
    ]);
  });

  it('should throw GoalNotFoundError for an unknown goal id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await expect(
      linkHandler.handle(
        new LinkCommitmentToGoalCommand(unknownId, commitmentId),
      ),
    ).rejects.toThrow(GoalNotFoundError);
  });

  it('should reject linking a commitment to an archived goal', async () => {
    await archiveHandler.handle(new ArchiveGoalCommand(goalId));

    await expect(
      linkHandler.handle(new LinkCommitmentToGoalCommand(goalId, commitmentId)),
    ).rejects.toThrow();
  });

  it('should reject linking a commitment to a completed goal', async () => {
    // Decisión B, Goal Lifecycle: complete() now requires Active first.
    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );
    await activateHandler.handle(new ActivateGoalCommand(goalId));
    await completeHandler.handle(new CompleteGoalCommand(goalId));

    await expect(
      linkHandler.handle(new LinkCommitmentToGoalCommand(goalId, commitmentId)),
    ).rejects.toThrow();
  });
});
