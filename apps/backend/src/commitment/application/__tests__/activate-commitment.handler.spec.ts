import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  IdentityId,
} from '@commitment/domain';
import { ActivateCommitmentCommandHandlerCore } from '../commands/activate-commitment.handler';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from '../commands/activate-commitment.handler';
import { ActivateCommitmentCommand } from '../commands/activate-commitment.command';
import { InMemoryCommitmentRepository } from '../../infrastructure/in-memory-commitment.repository';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';
import { DomainEvent } from '@commitment/domain';

const COMMITMENT_ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

function makeCommitment(id = COMMITMENT_ID): Commitment {
  return Commitment.register(
    new CommitmentId(id),
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Learn DDD'),
    null,
  );
}

describe('ActivateCommitmentCommandHandlerCore', () => {
  let repository: InMemoryCommitmentRepository;
  let dispatchedEvents: DomainEvent[];
  let dispatcher: DomainEventDispatcher;
  let handler: ActivateCommitmentCommandHandlerCore;

  beforeEach(() => {
    repository = new InMemoryCommitmentRepository();
    dispatchedEvents = [];
    dispatcher = {
      dispatch: (events) => {
        dispatchedEvents.push(...events);
        return Promise.resolve();
      },
    };
    handler = new ActivateCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('should activate a Draft commitment and return version 2', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    const result = await handler.handle(
      new ActivateCommitmentCommand(COMMITMENT_ID),
    );

    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Active');
    expect(result.version).toBe(2); // register event (1) + activate event (1) = 2
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]?.name).toBe('commitment.activated');
  });

  it('should be idempotent — activating three times returns same version with one event total', async () => {
    // Register
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    // First activation
    const r1 = await handler.handle(
      new ActivateCommitmentCommand(COMMITMENT_ID),
    );
    expect(r1.version).toBe(2); // register(1) + activate(1) = 2
    expect(dispatchedEvents).toHaveLength(1);

    // Second activation (idempotent)
    dispatchedEvents = [];
    const r2 = await handler.handle(
      new ActivateCommitmentCommand(COMMITMENT_ID),
    );
    expect(r2.commitmentId).toBe(COMMITMENT_ID);
    expect(r2.state).toBe('Active');
    expect(r2.version).toBe(r1.version); // version unchanged (Rule #87)
    expect(dispatchedEvents).toHaveLength(0);

    // Third activation (still idempotent)
    const r3 = await handler.handle(
      new ActivateCommitmentCommand(COMMITMENT_ID),
    );
    expect(r3.version).toBe(r1.version);
  });

  it('should throw CommitmentNotFoundError when commitment does not exist', async () => {
    const command = new ActivateCommitmentCommand(COMMITMENT_ID);
    await expect(handler.handle(command)).rejects.toThrow(
      CommitmentNotFoundError,
    );
  });

  it('should throw CommitmentStateConflictError when commitment is Cancelled', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.cancel();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateConflictError);
  });

  it('should throw CommitmentStateConflictError when commitment is Completed', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.activate();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.complete();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateConflictError);
  });

  it('should throw CommitmentStateTransitionError when commitment is Paused', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.activate();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.pause();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateTransitionError);
  });
});
