import { CompleteCommitmentCommandHandlerCore } from './complete-commitment.handler';
import { CompleteCommitmentCommand } from './complete-commitment.command';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from './complete-commitment.handler';
/* eslint-disable @typescript-eslint/unbound-method */
import {
  Commitment,
  CommitmentState,
  CommitmentId,
  IdentityId,
  CommitmentTitle,
  CommitmentDescription,
} from '@commitment/domain';
import { VersionedCommitmentRepository } from '../ports/versioned-commitment-repository.port';
import { DomainEventDispatcher } from '../ports/domain-event-dispatcher.port';

const COMMITMENT_ID = '018f6b5c-42e1-7000-8000-999999999991';
const IDENTITY_ID = '018f6b5c-42e1-7000-8000-999999999992';
const DRAFT_ID = '018f6b5c-42e1-7000-8000-999999999993';
const MISSING_ID = '018f6b5c-42e1-7000-8000-999999999999';

// Helpers to create commitments in specific states. Description is always
// set — Commitment Draft Lifecycle requires it for activate() to succeed.
function createDraftCommitment(id = DRAFT_ID): Commitment {
  return Commitment.register(
    new CommitmentId(id),
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Draft'),
    new CommitmentDescription('Test description'),
  );
}

function createActiveCommitment(): Commitment {
  const commitment = createDraftCommitment(COMMITMENT_ID);
  commitment.activate();
  return commitment;
}

function createPausedCommitment(): Commitment {
  const commitment = createActiveCommitment();
  commitment.pause();
  return commitment;
}

function createCompletedCommitment(): Commitment {
  const commitment = createActiveCommitment();
  commitment.complete();
  return commitment;
}

describe('CompleteCommitmentCommandHandlerCore', () => {
  let repository: jest.Mocked<VersionedCommitmentRepository>;
  let dispatcher: jest.Mocked<DomainEventDispatcher>;
  let handler: CompleteCommitmentCommandHandlerCore;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CompleteCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('happy path – Active → Completed', async () => {
    const commitment = createActiveCommitment();
    commitment.clearUncommittedEvents();

    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');
    const clearSpy = jest.spyOn(commitment, 'clearUncommittedEvents');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(3); // register(1) + activate(2) + complete(3)

    const result = await handler.handle(
      new CompleteCommitmentCommand(COMMITMENT_ID),
    );

    // Verify state transition
    expect(commitment.state).toBe(CommitmentState.Completed);

    // Verify interactions
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);

    // No leftover events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);

    // Result DTO correctness
    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Completed');
    expect(result.version).toBe(3);
  });

  it('happy path – Paused → Completed', async () => {
    const commitment = createPausedCommitment();
    commitment.clearUncommittedEvents();

    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(4); // register(1) + activate(2) + pause(3) + complete(4)

    const result = await handler.handle(
      new CompleteCommitmentCommand(COMMITMENT_ID),
    );

    expect(commitment.state).toBe(CommitmentState.Completed);
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);

    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Completed');
    expect(result.version).toBe(4);
  });

  it('idempotent when already completed', async () => {
    const commitment = createCompletedCommitment();
    commitment.clearUncommittedEvents(); // clear events so handler doesn't see them

    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(3);

    const result = await handler.handle(
      new CompleteCommitmentCommand(COMMITMENT_ID),
    );

    // No state change, no new events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);

    // Interactions: findById called, save called, but dispatch not called
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).not.toHaveBeenCalled();

    // Result reflects current version and state
    expect(result.version).toBe(3);
    expect(result.state).toBe('Completed');
  });

  it('throws CommitmentNotFoundError when commitment does not exist', async () => {
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(new CompleteCommitmentCommand(MISSING_ID)),
    ).rejects.toBeInstanceOf(CommitmentNotFoundError);

    // Ensure no side-effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Cancelled commitment', async () => {
    const commitment = createActiveCommitment();
    commitment.cancel(); // Terminal state

    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);

    await expect(
      handler.handle(new CompleteCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);

    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateTransitionError for Draft commitment', async () => {
    const commitment = createDraftCommitment();
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);

    await expect(
      handler.handle(new CompleteCommitmentCommand(DRAFT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateTransitionError);

    // Ensure no side-effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });
});
