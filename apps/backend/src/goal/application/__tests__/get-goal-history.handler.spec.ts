import { GetGoalHistoryQueryHandlerCore } from '../queries/get-goal-history.handler';
import { GetGoalHistoryQuery } from '../queries/get-goal-history.query';
import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { RenameGoalCommandHandlerCore } from '../commands/rename-goal.handler';
import { RenameGoalCommand } from '../commands/rename-goal.command';
import { ActivateGoalCommandHandlerCore } from '../commands/activate-goal.handler';
import { ActivateGoalCommand } from '../commands/activate-goal.command';
import { CompleteGoalCommandHandlerCore } from '../commands/complete-goal.handler';
import { CompleteGoalCommand } from '../commands/complete-goal.command';
import { LinkCommitmentToGoalCommandHandlerCore } from '../commands/link-commitment-to-goal.handler';
import { LinkCommitmentToGoalCommand } from '../commands/link-commitment-to-goal.command';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

describe('GetGoalHistoryQueryHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let historyHandler: GetGoalHistoryQueryHandlerCore;
  let registerHandler: RegisterGoalCommandHandlerCore;
  let renameHandler: RenameGoalCommandHandlerCore;
  let activateHandler: ActivateGoalCommandHandlerCore;
  let completeHandler: CompleteGoalCommandHandlerCore;
  let linkHandler: LinkCommitmentToGoalCommandHandlerCore;

  const goalId = '018f6b5c-42e1-7000-8000-999999999999';
  const identityId = '018f6b5c-42e1-7000-8000-111111111111';
  const commitmentId = '018f6b5c-42e1-7000-8000-222222222222';

  beforeEach(() => {
    repository = new InMemoryGoalRepository();
    eventStore = new InMemoryEventStore();
    dispatcher = {
      dispatch: () => Promise.resolve(),
    };

    historyHandler = new GetGoalHistoryQueryHandlerCore(eventStore);
    registerHandler = new RegisterGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    renameHandler = new RenameGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    activateHandler = new ActivateGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    completeHandler = new CompleteGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
    linkHandler = new LinkCommitmentToGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
    );
  });

  it('should return an empty history for a goal with no events yet', async () => {
    const history = await historyHandler.handle(
      new GetGoalHistoryQuery(goalId),
    );
    expect(history).toEqual([]);
  });

  it('should return the full ordered history with mapped type/summary/version', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(
        goalId,
        identityId,
        'Run a half marathon',
        'Train consistently',
      ),
    );
    await renameHandler.handle(new RenameGoalCommand(goalId, 'Run a marathon'));
    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );
    await activateHandler.handle(new ActivateGoalCommand(goalId));
    await completeHandler.handle(new CompleteGoalCommand(goalId));

    const history = await historyHandler.handle(
      new GetGoalHistoryQuery(goalId),
    );

    expect(history.map((h) => h.type)).toEqual([
      'goal.registered',
      'goal.renamed',
      'goal.commitment_linked',
      'goal.activated',
      'goal.completed',
    ]);
    expect(history.map((h) => h.version)).toEqual([1, 2, 3, 4, 5]);
    expect(history[0]?.summary).toBe('Goal "Run a half marathon" was created');
    expect(history[1]?.summary).toBe('Renamed to "Run a marathon"');
    expect(history[2]?.summary).toBe(`Linked commitment ${commitmentId}`);
    expect(history[3]?.summary).toBe('Goal activated');
    expect(history[4]?.summary).toBe('Goal completed');
    expect(history.every((h) => typeof h.timestamp === 'string')).toBe(true);
  });

  it('should not add a history entry for an idempotent no-op command', async () => {
    await registerHandler.handle(
      new RegisterGoalCommand(goalId, identityId, 'Run a half marathon'),
    );
    // Re-linking the same commitment is a no-op — no new event, no new history entry
    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );
    await linkHandler.handle(
      new LinkCommitmentToGoalCommand(goalId, commitmentId),
    );

    const history = await historyHandler.handle(
      new GetGoalHistoryQuery(goalId),
    );
    expect(history).toHaveLength(2); // registered + one link, not two
  });
});
