import { RegisterGoalCommandHandlerCore } from '../commands/register-goal.handler';
import { GoalId, DomainEvent } from '@commitment/domain';
import { RegisterGoalCommand } from '../commands/register-goal.command';
import { InMemoryGoalRepository } from '../../infrastructure/in-memory-goal.repository';
import { InMemoryEventStore } from '../../../infrastructure/event-store/in-memory-event-store';
import { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import { Counter } from 'prom-client';

describe('RegisterGoalCommandHandlerCore', () => {
  let repository: InMemoryGoalRepository;
  let eventStore: InMemoryEventStore;
  let dispatcher: DomainEventDispatcher;
  let handler: RegisterGoalCommandHandlerCore;
  let dispatchedEvents: DomainEvent[];

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

    const mockCounter = {
      inc: jest.fn(),
    } as unknown as Counter<string>;

    handler = new RegisterGoalCommandHandlerCore(
      repository,
      dispatcher,
      eventStore,
      mockCounter,
    );
  });

  it('should successfully register a goal and dispatch events', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const command = new RegisterGoalCommand(
      id,
      identityId,
      'Run a half marathon',
      'Train consistently',
    );

    const result = await handler.handle(command);

    expect(result.goalId).toBe(id);
    expect(result.version).toBe(1);

    const saved = await repository.findById(new GoalId(id));
    expect(saved).toBeDefined();
    expect(saved?.title.value).toBe('Run a half marathon');
    expect(saved?.description?.value).toBe('Train consistently');

    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('goal.registered');

    const history = await eventStore.getEvents(id);
    expect(history).toHaveLength(1);
    expect(history[0]?.name).toBe('goal.registered');
  });

  it('should register idempotently if the same goal id is received twice', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const command = new RegisterGoalCommand(id, identityId, 'First Title');

    const result1 = await handler.handle(command);
    expect(result1.goalId).toBe(id);
    expect(dispatchedEvents).toHaveLength(1);

    dispatchedEvents = [];

    const command2 = new RegisterGoalCommand(id, identityId, 'Second Title');
    const result2 = await handler.handle(command2);

    expect(result2.goalId).toBe(id);
    expect(result2.version).toBe(1);
    expect(dispatchedEvents).toHaveLength(0);

    const saved = await repository.findById(new GoalId(id));
    expect(saved?.title.value).toBe('First Title'); // Remains unmodified

    const history = await eventStore.getEvents(id);
    expect(history).toHaveLength(1); // no double-write on the idempotent call
  });

  it('should propagate domain exception errors if title exceeds maximum length', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const longTitle = 'a'.repeat(300);
    const command = new RegisterGoalCommand(id, identityId, longTitle);

    await expect(handler.handle(command)).rejects.toThrow();
  });
});
