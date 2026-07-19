import { ResumeCommitmentCommandHandlerCore } from './resume-commitment.handler';
import { ResumeCommitmentCommand } from './resume-commitment.command';
import {
  CommitmentNotFoundError,
  CommitmentStateConflictError,
  CommitmentStateTransitionError,
} from './resume-commitment.handler';
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

// Helper to create a paused commitment (register → activate → pause)
function createPausedCommitment(): Commitment {
  const id = new CommitmentId(COMMITMENT_ID);
  const commitment = Commitment.register(
    id,
    new IdentityId(IDENTITY_ID),
    new CommitmentTitle('Test'),
    new CommitmentDescription('Test description'),
  );
  commitment.activate(true);
  commitment.pause();
  return commitment;
}

describe('ResumeCommitmentCommandHandlerCore', () => {
  let repository: jest.Mocked<VersionedCommitmentRepository>;
  let dispatcher: jest.Mocked<DomainEventDispatcher>;
  let handler: ResumeCommitmentCommandHandlerCore;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ResumeCommitmentCommandHandlerCore(repository, dispatcher);
  });

  it('happy path – Paused → Active', async () => {
    const commitment = createPausedCommitment();
    commitment.clearUncommittedEvents();
    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');
    const clearSpy = jest.spyOn(commitment, 'clearUncommittedEvents');
    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(4); // register(1) + activate(2) + pause(3) + resume(4)

    const result = await handler.handle(
      new ResumeCommitmentCommand(COMMITMENT_ID),
    );

    // Verify state transition
    expect(commitment.state).toBe(CommitmentState.Active);
    // Verify interactions
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalledTimes(1);
    // No leftover events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);
    // Result DTO correctness
    expect(result.commitmentId).toBe(COMMITMENT_ID);
    expect(result.state).toBe('Active');
    expect(result.version).toBe(4);
  });

  it('idempotent when already active', async () => {
    const commitment = createPausedCommitment();
    // Resume to move to Active, then clear so handler-produced events are isolated
    commitment.resume();
    commitment.clearUncommittedEvents();
    const findSpy = jest.spyOn(repository, 'findById');
    const saveSpy = jest.spyOn(repository, 'save');

    repository.findById.mockResolvedValue(commitment);
    repository.save.mockResolvedValue(4);

    const result = await handler.handle(
      new ResumeCommitmentCommand(COMMITMENT_ID),
    );

    // No state change, no new events
    expect(commitment.getUncommittedEvents()).toHaveLength(0);
    // Interactions: findById called, save called, but dispatch not called
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(dispatcher.dispatch).not.toHaveBeenCalled();

    // Result reflects current version and state
    expect(result.version).toBe(4);
    expect(result.state).toBe('Active');
  });

  it('throws CommitmentNotFoundError when commitment does not exist', async () => {
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(null);
    await expect(
      handler.handle(new ResumeCommitmentCommand(MISSING_ID)),
    ).rejects.toBeInstanceOf(CommitmentNotFoundError);
    // Ensure no side-effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Completed commitment', async () => {
    const commitment = createPausedCommitment();
    // Resume then complete to reach terminal state
    commitment.resume();
    commitment.complete();
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);
    await expect(
      handler.handle(new ResumeCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);
    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateConflictError for Cancelled commitment', async () => {
    const commitment = createPausedCommitment();
    commitment.cancel();
    const findSpy = jest.spyOn(repository, 'findById');
    repository.findById.mockResolvedValue(commitment);
    await expect(
      handler.handle(new ResumeCommitmentCommand(COMMITMENT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateConflictError);
    // No side effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });

  it('throws CommitmentStateTransitionError for Draft commitment', async () => {
    // Commitment in Draft state cannot be resumed
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
      handler.handle(new ResumeCommitmentCommand(DRAFT_ID)),
    ).rejects.toBeInstanceOf(CommitmentStateTransitionError);
    // Ensure no side-effects
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(repository.save).not.toHaveBeenCalled();
    expect(dispatcher.dispatch).not.toHaveBeenCalled();
  });
});
