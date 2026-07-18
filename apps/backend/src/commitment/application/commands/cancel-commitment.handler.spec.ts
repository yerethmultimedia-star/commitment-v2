import { CancelCommitmentCommandHandlerCore } from './cancel-commitment.handler';
import { CancelCommitmentCommand } from './cancel-commitment.command';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
} from './cancel-commitment.handler';
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
const MISSING_ID = '018f6b5c-42e1-7000-8000-999999999999';

// Helpers to create commitments in specific states. Description is always
// set — Commitment Draft Lifecycle requires it for activate() to succeed.
function createDraftCommitment(id = COMMITMENT_ID): Commitment {
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

function createCompletedCommitment(): Commitment {
  const commitment = createActiveCommitment();
  commitment.complete();
  return commitment;
}

function createCancelledCommitment(): Commitment {
  const commitment = createActiveCommitment();
  commitment.cancel();
  return commitment;
}

describe('CancelCommitmentCommandHandlerCore', () => {
  let repository: jest.Mocked<VersionedCommitmentRepository>;
  let dispatcher: jest.Mocked<DomainEventDispatcher>;
  let handler: CancelCommitmentCommandHandlerCore;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CancelCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('happy path – Active → Cancelled', async () => {
    const commitment = createActiveCommitment();
    commitment.clearUncommittedEvents();

    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');
    const clearSpy = jest.spyOn(commitment, 'clearUncommittedEvents');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(3);

    const result = await handler.handle(
      new CancelCommitmentCommand(COMMITMENT_ID),
    );

    // Verify state transition
    expect(commitment.state).toBe(CommitmentState.Cancelled);

    // Verify interactions
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);

    // No leftover events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);

    // Result DTO correctness
    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Cancelled');
    expect(result.version).toBe(3);
  });

  it('idempotent when already cancelled', async () => {
    const commitment = createCancelledCommitment();
    commitment.clearUncommittedEvents();

    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(3);

    const result = await handler.handle(
      new CancelCommitmentCommand(COMMITMENT_ID),
    );

    // No state change, no new events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);

    // Interactions: findById called, save called, but dispatch not called
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).not.toHaveBeenCalled();

    // Result reflects current version and state
    expect(result.version).toBe(3);
    expect(result.state).toBe('Cancelled');
  });

  it('throws CommitmentNotFoundError when commitment does not exist', async () => {
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(new CancelCommitmentCommand(MISSING_ID)),
    ).rejects.toBeInstanceOf(CommitmentNotFoundError);

    // Ensure no side-effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Completed commitment', async () => {
    const commitment = createCompletedCommitment();

    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);

    await expect(
      handler.handle(new CancelCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);

    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });
});
