import {
  Commitment,
  CommitmentId,
  CommitmentTitle,
  CommitmentDescription,
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
import { CommitmentActivationPreconditions } from '../ports/commitment-activation-preconditions.port';
import { DomainEvent } from '@commitment/domain';

const COMMITMENT_ID = '018f6b5c-42e1-7000-8000-999999999999';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-111111111111';

// Commitment Draft Lifecycle: activate() now requires a description, so
// every fixture here needs one unless the test is specifically exercising
// that requirement (see "missing description" test below).
function makeCommitment(
  id = COMMITMENT_ID,
  description: string | null = 'Read the blue book',
): Commitment {
  return Commitment.register(
    new CommitmentId(id),
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Learn DDD'),
    description ? new CommitmentDescription(description) : null,
  );
}

describe('ActivateCommitmentCommandHandlerCore', () => {
  let repository: InMemoryCommitmentRepository;
  let dispatchedEvents: DomainEvent[];
  let dispatcher: DomainEventDispatcher;
  let activationPreconditions: CommitmentActivationPreconditions;
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
    // Command Preconditions (ADR-022 §3) — stubbed here since this suite
    // exercises state-transition rules, not the execution-plan requirement
    // itself (covered separately in activate-commitment integration tests).
    activationPreconditions = {
      hasExecutionPlan: () => Promise.resolve(true),
    };
    handler = new ActivateCommitmentCommandHandlerCore(
      repository,
      dispatcher,
      activationPreconditions,
    );
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
    commitment.activate(true);
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.complete();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateConflictError);
  });

  it('should throw CommitmentStateConflictError when the commitment has no description', async () => {
    const commitment = makeCommitment(COMMITMENT_ID, null);
    await repository.save(commitment);
    commitment.clearUncommittedEvents();

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateConflictError);
  });

  it('should throw CommitmentStateConflictError when the execution plan precondition is not met (ADR-022 §3.1)', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    activationPreconditions = {
      hasExecutionPlan: () => Promise.resolve(false),
    };
    handler = new ActivateCommitmentCommandHandlerCore(
      repository,
      dispatcher,
      activationPreconditions,
    );

    await expect(
      handler.handle(new ActivateCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toThrow(CommitmentStateConflictError);
  });

  it('should throw CommitmentStateTransitionError when commitment is Paused', async () => {
    const commitment = makeCommitment();
    await repository.save(commitment);
    commitment.clearUncommittedEvents();
    commitment.activate(true);
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
