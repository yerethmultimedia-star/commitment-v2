import {
  UpdateGoalDescriptionCommandHandlerCore,
  GoalNotFoundError,
  GoalStateConflictError,
} from '../commands/update-goal-description.handler';
import { UpdateGoalDescriptionCommand } from '../commands/update-goal-description.command';
import { ActivateGoalCommandHandlerCore } from '../commands/activate-goal.handler';
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

describe('UpdateGoalDescriptionCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let dispatchedEvents: DomainEvent[];
  let registerHandler: RegisterGoalCommandHandlerCore;
  let updateDescriptionHandler: UpdateGoalDescriptionCommandHandlerCore;
  let linkHandler: LinkCommitmentToGoalCommandHandlerCore;
  let activateHandler: ActivateGoalCommandHandlerCore;
  let archiveHandler: ArchiveGoalCommandHandlerCore;

  const id = '018f6b5c-42e1-7000-8000-999999999999';
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
    updateDescriptionHandler = new UpdateGoalDescriptionCommandHandlerCore(
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

    // No description passed — the exact shape Quick Capture produces today.
    await registerHandler.handle(
      new RegisterGoalCommand(id, identityId, 'Learn to sail'),
    );
    dispatchedEvents = [];
  });

  it('should set a description on a Goal that was registered without one', async () => {
    const result = await updateDescriptionHandler.handle(
      new UpdateGoalDescriptionCommand(id, 'Get comfortable on open water'),
    );

    expect(result.goalId).toBe(id);
    expect(result.description).toBe('Get comfortable on open water');
    expect(result.version).toBe(2);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.description_updated');
  });

  it('should be a no-op when the description is unchanged (Rule #77)', async () => {
    await updateDescriptionHandler.handle(
      new UpdateGoalDescriptionCommand(id, 'Get comfortable on open water'),
    );
    dispatchedEvents = [];

    const result = await updateDescriptionHandler.handle(
      new UpdateGoalDescriptionCommand(id, 'Get comfortable on open water'),
    );

    expect(result.version).toBe(2); // unchanged
    expect(dispatchedEvents).toHaveLength(0);
  });

  it('should throw GoalNotFoundError for an unknown goal id', async () => {
    const unknownId = '018f6b5c-42e1-7000-8000-000000000000';
    await expect(
      updateDescriptionHandler.handle(
        new UpdateGoalDescriptionCommand(unknownId, 'Anything'),
      ),
    ).rejects.toThrow(GoalNotFoundError);
  });

  it('should reject updating an archived goal', async () => {
    await archiveHandler.handle(new ArchiveGoalCommand(id));

    await expect(
      updateDescriptionHandler.handle(
        new UpdateGoalDescriptionCommand(id, 'Anything'),
      ),
    ).rejects.toThrow(GoalStateConflictError);
  });

  it('unblocks activate() end-to-end for a Goal registered without a description (the Quick Capture gap)', async () => {
    await linkHandler.handle(new LinkCommitmentToGoalCommand(id, commitmentId));

    await expect(
      activateHandler.handle(new ActivateGoalCommand(id)),
    ).rejects.toThrow();

    await updateDescriptionHandler.handle(
      new UpdateGoalDescriptionCommand(id, 'Get comfortable on open water'),
    );

    const result = await activateHandler.handle(new ActivateGoalCommand(id));
    expect(result.state).toBe('Active');
  });
});
