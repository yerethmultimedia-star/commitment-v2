import { RegisterCommitmentCommandHandlerCore } from '../commands/register-commitment.handler';
import { CommitmentId } from '@commitment/domain';
import { RegisterCommitmentCommand } from '../commands/register-commitment.command';
import { InMemoryCommitmentRepository } from '../../infrastructure/in-memory-commitment.repository';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { DomainEvent } from '@commitment/domain';

describe('RegisterCommitmentCommandHandlerCore', () => {
  let repository: InMemoryCommitmentRepository;
  let dispatcher: DomainEventDispatcher;
  let handler: RegisterCommitmentCommandHandlerCore;
  let dispatchedEvents: DomainEvent[];

  beforeEach(() => {
    repository = new InMemoryCommitmentRepository();
    dispatchedEvents = [];
    dispatcher = {
      dispatch: (events) => {
        dispatchedEvents.push(...events);
        return Promise.resolve();
      },
    };
    handler = new RegisterCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('should successfully register a commitment and dispatch events', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const command = new RegisterCommitmentCommand(
      id,
      identityId,
      'Practice Clean Architecture',
      'Read docs and follow the guidelines',
    );

    const result = await handler.handle(command);

    expect(result.commitmentId).toBe(id);
    expect(result.version).toBe(1);

    const saved = await repository.findById(new CommitmentId(id));
    expect(saved).toBeDefined();
    expect(saved?.title.value).toBe('Practice Clean Architecture');
    expect(saved?.description?.value).toBe(
      'Read docs and follow the guidelines',
    );

    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('commitment.registered');
  });

  it('should register idempotently if the same commitment id is received twice', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const command = new RegisterCommitmentCommand(
      id,
      identityId,
      'First Title',
      'Desc',
    );

    // First call
    const result1 = await handler.handle(command);
    expect(result1.commitmentId).toBe(id);
    expect(dispatchedEvents).toHaveLength(1);

    // Clear event history to ensure second execution doesn't raise anything
    dispatchedEvents = [];

    // Second call with different title (to verify it doesn't modify and exits idempotently)
    const command2 = new RegisterCommitmentCommand(
      id,
      identityId,
      'Second Title',
      'Desc',
    );
    const result2 = await handler.handle(command2);

    expect(result2.commitmentId).toBe(id);
    expect(result2.version).toBe(1);
    expect(dispatchedEvents).toHaveLength(0);

    const saved = await repository.findById(new CommitmentId(id));
    expect(saved?.title.value).toBe('First Title'); // Remains unmodified
  });

  it('should propagate domain exception errors if title exceeds maximum length', async () => {
    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const longTitle = 'a'.repeat(200); // constraints max is 150
    const command = new RegisterCommitmentCommand(
      id,
      identityId,
      longTitle,
      '',
    );

    await expect(handler.handle(command)).rejects.toThrow();
  });
});
