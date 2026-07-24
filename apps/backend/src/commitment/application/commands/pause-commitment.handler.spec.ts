import { PauseCommitmentCommandHandlerCore } from './pause-commitment.handler';
import { PauseCommitmentCommand } from './pause-commitment.command';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from './pause-commitment.handler';
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

// Fixed UUIDs for use across the spec
const COMMITMENT_ID = '00000000-0000-0000-0000-000000000001';
const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';
const DRAFT_ID = '00000000-0000-0000-0000-000000000002';
const MISSING_ID = '00000000-0000-0000-0000-000000000099';

// Helper to create an active commitment
function createActiveCommitment(): Commitment {
  const id = new CommitmentId(COMMITMENT_ID);
  const commitment = Commitment.register(
    id,
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Test'),
    new CommitmentDescription('Test description'),
  );
  // Activate the commitment to move to Active state
  commitment.activate(true);
  return commitment;
}

describe('PauseCommitmentCommandHandlerCore', () => {
  let repository: jest.Mocked<VersionedCommitmentRepository>;
  let dispatcher: jest.Mocked<DomainEventDispatcher>;
  let handler: PauseCommitmentCommandHandlerCore;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    handler = new PauseCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('happy path – Active → Paused', async () => {
    const commitment = createActiveCommitment();
    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');
    const clearSpy = jest.spyOn(commitment, 'clearUncommittedEvents');
    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(2); // version after save

    const result = await handler.handle(
      new PauseCommitmentCommand(COMMITMENT_ID),
    );

    // Verify state transition
    expect(commitment.state).toBe(CommitmentState.Paused);
    // Verify interactions
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(expect.anything());
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);
    // No leftover events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);
    // Result DTO correctness
    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Paused');
    expect(result.version).toBe(2);
  });

  it('idempotent when already paused', async () => {
    const commitment = createActiveCommitment();
    // First pause to move to Paused state, then clear so handler-produced events are isolated
    commitment.pause();
    commitment.clearUncommittedEvents();
    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(2);

    const result = await handler.handle(
      new PauseCommitmentCommand(COMMITMENT_ID),
    );

    // No state change, no new events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);
    // Interactions: findById and save always called (TD-003: no handler-level
    // idempotency branch); dispatch is still invoked, but with zero events —
    // that's the actual observable behavior, not whether dispatch() itself
    // was called.
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledWith([]);

    // Result reflects current version and state
    expect(result.version).toBe(2);
    expect(result.state).toBe('Paused');
  });

  it('throws CommitmentNotFoundError when commitment does not exist', async () => {
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(null);
    await expect(
      handler.handle(new PauseCommitmentCommand(MISSING_ID)),
    ).rejects.toBeInstanceOf(CommitmentNotFoundError);
    // Ensure no side‑effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Completed commitment', async () => {
    const commitment = createActiveCommitment();
    // Transition to Completed
    commitment.complete();
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);
    await expect(
      handler.handle(new PauseCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);
    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Cancelled commitment', async () => {
    const commitment = createActiveCommitment();
    commitment.cancel();
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);
    await expect(
      handler.handle(new PauseCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);
    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateTransitionError for invalid transition', async () => {
    // Commitment in Draft state cannot be paused
    const id = new CommitmentId(DRAFT_ID);
    const commitment = Commitment.register(
      id,
      new IdentityId(IDENTITY_ID),
      new CommitmentTitle('Draft'),
      null,
    );
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);
    await expect(
      handler.handle(new PauseCommitmentCommand(DRAFT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateTransitionError);
    // Ensure no side‑effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });
});
