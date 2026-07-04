import { Commitment, CommitmentState } from '../aggregate/commitment.js';
import { CommitmentId } from '../value-objects/commitment-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentTitle } from '../value-objects/commitment-title.js';
import { CommitmentDescription } from '../value-objects/commitment-description.js';
import { CommitmentConstraints } from '../constants/commitment-constraints.js';
import { CommitmentRepository } from '../repositories/commitment.repository.js';
import { CommitmentRegisteredEvent } from '../events/commitment-registered.event.js';
import { CommitmentActivatedEvent } from '../events/commitment-activated.event.js';
import { CommitmentRenamedEvent } from '../events/commitment-renamed.event.js';
import { CommitmentDescriptionUpdatedEvent } from '../events/commitment-description-updated.event.js';
import {
  CommitmentAlreadyActiveError,
  CommitmentRequiresIdentityError,
  InvalidCommitmentTitleError,
  InvalidCommitmentDescriptionError,
  InvalidCommitmentStateTransitionError,
  CommitmentAlreadyCompletedError,
  CommitmentAlreadyCancelledError,
  CommitmentCannotBePausedError,
  CommitmentCannotBeResumedError,
  CommitmentCannotBeCompletedError,
  CommitmentCannotBeRenamedError,
  CommitmentCannotBeDescriptionUpdatedError
} from '../errors/commitment-errors.js';

describe('Commitment Bounded Context', () => {
  const validIdentityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
  const validTitle = new CommitmentTitle('Learn Domain Driven Design');
  const validDescription = new CommitmentDescription('Read blue book and write aggregates');

  describe('Value Objects', () => {
    describe('CommitmentId', () => {
      it('should instantiate and support equality checks', () => {
        const id1 = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
        const id2 = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
        const id3 = new CommitmentId('018f6b5c-42e1-7000-8000-888888888888');

        expect(id1.equals(id2)).toBe(true);
        expect(id1.equals(id3)).toBe(false);
      });
    });

    describe('CommitmentTitle', () => {
      it('should accept valid title and trim whitespaces', () => {
        const title = new CommitmentTitle('  My Commitment Title   ');
        expect(title.value).toBe('My Commitment Title');
      });

      it('should reject empty or whitespace only titles', () => {
        expect(() => new CommitmentTitle('')).toThrow(InvalidCommitmentTitleError);
        expect(() => new CommitmentTitle('   ')).toThrow(InvalidCommitmentTitleError);
        expect(CommitmentTitle.isValid('')).toBe(false);
        expect(CommitmentTitle.isValid(null as unknown as string)).toBe(false);
      });

      it('should reject titles exceeding max length limit', () => {
        const longTitle = 'a'.repeat(CommitmentConstraints.MAX_TITLE_LENGTH + 1);
        expect(() => new CommitmentTitle(longTitle)).toThrow(InvalidCommitmentTitleError);
        expect(CommitmentTitle.isValid(longTitle)).toBe(false);
      });
    });

    describe('CommitmentDescription', () => {
      it('should accept valid optional description and trim values', () => {
        const desc = new CommitmentDescription('  Do daily exercise routines  ');
        expect(desc.value).toBe('Do daily exercise routines');
      });

      it('should accept empty or missing descriptions', () => {
        const emptyDesc = new CommitmentDescription('');
        expect(emptyDesc.value).toBe('');
        
        expect(CommitmentDescription.isValid(null as unknown as string)).toBe(true);
        expect(CommitmentDescription.isValid(undefined as unknown as string)).toBe(true);
      });

      it('should reject descriptions exceeding max length limit', () => {
        const longDesc = 'a'.repeat(CommitmentConstraints.MAX_DESCRIPTION_LENGTH + 1);
        expect(() => new CommitmentDescription(longDesc)).toThrow(InvalidCommitmentDescriptionError);
        expect(CommitmentDescription.isValid(longDesc)).toBe(false);
      });
    });
  });

  describe('Commitment Aggregate Root', () => {
    it('should register a commitment in Draft state and raise registered event', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(
        commitmentId,
        validIdentityId,
        validTitle,
        validDescription
      );

      expect(commitment.id.equals(commitmentId)).toBe(true);
      expect(commitment.identityId.equals(validIdentityId)).toBe(true);
      expect(commitment.title.equals(validTitle)).toBe(true);
      expect(commitment.description?.equals(validDescription)).toBe(true);
      expect(commitment.state).toBe(CommitmentState.Draft);

      const uncommittedEvents = commitment.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(1);
      
      const registeredEvent = uncommittedEvents[0] as CommitmentRegisteredEvent;
      expect(registeredEvent).toBeDefined();
      expect(registeredEvent.name).toBe('commitment.registered');
      expect(registeredEvent.metadata.aggregateId).toBe(commitmentId.value);
      expect(registeredEvent.payload.commitmentId).toBe(commitmentId.value);
      expect(registeredEvent.payload.identityId).toBe(validIdentityId.value);
      expect(registeredEvent.payload.title).toBe(validTitle.value);
      expect(registeredEvent.payload.description).toBe(validDescription.value);
    });

    it('should register with null/empty description correctly', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(
        commitmentId,
        validIdentityId,
        validTitle,
        null
      );

      expect(commitment.description).toBeNull();
      const uncommittedEvents = commitment.getUncommittedEvents();
      const registeredEvent = uncommittedEvents[0] as CommitmentRegisteredEvent;
      expect(registeredEvent.payload.description).toBe('');
    });

    it('should enforce aggregate entity equality based on ID', () => {
      const id = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const c1 = Commitment.register(id, validIdentityId, validTitle, null);
      const c2 = Commitment.register(id, validIdentityId, new CommitmentTitle('Different Title'), null);
      const c3 = Commitment.register(new CommitmentId('018f6b5c-42e1-7000-8000-888888888888'), validIdentityId, validTitle, null);

      expect(c1.equals(c2)).toBe(true);
      expect(c1.equals(c3)).toBe(false);
    });

    it('should throw error when registering without identityId', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      expect(() =>
        Commitment.register(
          commitmentId,
          null as unknown as IdentityId,
          validTitle,
          validDescription
        )
      ).toThrow(CommitmentRequiresIdentityError);
    });

    it('should activate draft commitment and raise activated event', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(
        commitmentId,
        validIdentityId,
        validTitle,
        validDescription
      );

      commitment.clearUncommittedEvents();
      commitment.activate();

      expect(commitment.state).toBe(CommitmentState.Active);

      const uncommittedEvents = commitment.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(1);

      const activatedEvent = uncommittedEvents[0] as CommitmentActivatedEvent;
      expect(activatedEvent).toBeDefined();
      expect(activatedEvent.name).toBe('commitment.activated');
      expect(activatedEvent.payload.commitmentId).toBe(commitmentId.value);
    });

    it('should throw error when activating an already active commitment', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        validDescription
      );

      commitment.activate();
      expect(() => commitment.activate()).toThrow(CommitmentAlreadyActiveError);
    });

    it('should pause an active commitment and resume it successfully', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );
      commitment.activate();
      commitment.clearUncommittedEvents();

      // Pause
      commitment.pause();
      expect(commitment.state).toBe(CommitmentState.Paused);
      expect(commitment.getUncommittedEvents()).toHaveLength(1);
      expect(commitment.getUncommittedEvents()[0]?.name).toBe('commitment.paused');

      commitment.clearUncommittedEvents();

      // Resume
      commitment.resume();
      expect(commitment.state).toBe(CommitmentState.Active);
      expect(commitment.getUncommittedEvents()).toHaveLength(1);
      expect(commitment.getUncommittedEvents()[0]?.name).toBe('commitment.resumed');
    });

    it('should reject pausing or resuming from invalid states', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );

      // Cannot pause a draft
      expect(() => commitment.pause()).toThrow(CommitmentCannotBePausedError);
      
      // Cannot resume a draft
      expect(() => commitment.resume()).toThrow(CommitmentCannotBeResumedError);
      
      commitment.activate();
      // Cannot resume an active
      expect(() => commitment.resume()).toThrow(CommitmentCannotBeResumedError);

      commitment.pause();
      // Cannot pause a paused
      expect(() => commitment.pause()).toThrow(CommitmentCannotBePausedError);
    });

    it('should cancel commitment from Draft, Active, or Paused states', () => {
      const draft = Commitment.register(new CommitmentId('018f6b5c-42e1-7000-8000-100000000000'), validIdentityId, validTitle, null);
      draft.cancel();
      expect(draft.state).toBe(CommitmentState.Cancelled);
      expect(draft.getUncommittedEvents()[1]?.name).toBe('commitment.cancelled');

      const active = Commitment.register(new CommitmentId('018f6b5c-42e1-7000-8000-200000000000'), validIdentityId, validTitle, null);
      active.activate();
      active.cancel();
      expect(active.state).toBe(CommitmentState.Cancelled);

      const paused = Commitment.register(new CommitmentId('018f6b5c-42e1-7000-8000-300000000000'), validIdentityId, validTitle, null);
      paused.activate();
      paused.pause();
      paused.cancel();
      expect(paused.state).toBe(CommitmentState.Cancelled);
    });

    it('should complete active commitment and reject transitions on completed commitments', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );

      // Draft cannot complete
      expect(() => commitment.complete()).toThrow(CommitmentCannotBeCompletedError);

      commitment.activate();
      commitment.complete();
      expect(commitment.state).toBe(CommitmentState.Completed);
      expect(commitment.getUncommittedEvents()[2]?.name).toBe('commitment.completed');

      // Completed is immutable
      expect(() => commitment.activate()).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.pause()).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.resume()).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.cancel()).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.complete()).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.rename(new CommitmentTitle('New Name'))).toThrow(CommitmentAlreadyCompletedError);
      expect(() => commitment.updateDescription(null)).toThrow(CommitmentAlreadyCompletedError);
    });

    it('should reject transitions and modification behaviors on cancelled commitments', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );
      commitment.cancel();

      expect(() => commitment.activate()).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.pause()).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.resume()).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.cancel()).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.complete()).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.rename(new CommitmentTitle('New Name'))).toThrow(CommitmentAlreadyCancelledError);
      expect(() => commitment.updateDescription(null)).toThrow(CommitmentAlreadyCancelledError);
    });

    it('should rename commitment only if title is different (Rule #77)', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );

      commitment.clearUncommittedEvents();

      // Rename to SAME name -> no event raised
      commitment.rename(new CommitmentTitle(validTitle.value));
      expect(commitment.getUncommittedEvents()).toHaveLength(0);

      // Rename to DIFFERENT name -> event raised
      const newTitle = new CommitmentTitle('Learn Advanced DDD Architectures');
      commitment.rename(newTitle);
      expect(commitment.title.value).toBe(newTitle.value);
      expect(commitment.getUncommittedEvents()).toHaveLength(1);
      expect(commitment.getUncommittedEvents()[0]?.name).toBe('commitment.renamed');
      expect((commitment.getUncommittedEvents()[0] as CommitmentRenamedEvent).payload.title).toBe(newTitle.value);
    });

    it('should update description only if value is different (Rule #77)', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        validDescription
      );

      commitment.clearUncommittedEvents();

      // Update to SAME description -> no event raised
      commitment.updateDescription(new CommitmentDescription(validDescription.value));
      expect(commitment.getUncommittedEvents()).toHaveLength(0);

      // Update to DIFFERENT description -> event raised
      const newDesc = new CommitmentDescription('Practice aggregate modeling and events storming');
      commitment.updateDescription(newDesc);
      expect(commitment.description?.value).toBe(newDesc.value);
      expect(commitment.getUncommittedEvents()).toHaveLength(1);
      expect(commitment.getUncommittedEvents()[0]?.name).toBe('commitment.description_updated');
      expect((commitment.getUncommittedEvents()[0] as CommitmentDescriptionUpdatedEvent).payload.description).toBe(newDesc.value);

      commitment.clearUncommittedEvents();

      // Update to null -> event raised
      commitment.updateDescription(null);
      expect(commitment.description).toBeNull();
      expect(commitment.getUncommittedEvents()).toHaveLength(1);
      expect((commitment.getUncommittedEvents()[0] as CommitmentDescriptionUpdatedEvent).payload.description).toBe('');
      
      commitment.clearUncommittedEvents();
      // Update from null to null -> no event
      commitment.updateDescription(null);
      expect(commitment.getUncommittedEvents()).toHaveLength(0);
    });

    it('should load state from historical event stream containing all lifecycle events', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const c = Commitment.register(commitmentId, validIdentityId, validTitle, validDescription);
      
      const newTitle = new CommitmentTitle('Learn advanced patterns');
      c.rename(newTitle);
      
      const newDesc = new CommitmentDescription('Practice modeling clean architecture aggregates');
      c.updateDescription(newDesc);
      
      c.activate();
      c.pause();
      c.resume();
      c.complete();
      
      const events = [...c.getUncommittedEvents()];

      // Rehydrate new aggregate instance from stream using the same ID
      const c2 = Commitment.register(
        commitmentId,
        validIdentityId,
        new CommitmentTitle('Dummy'),
        null
      );
      c2.loadFromHistory(events);

      expect(c2.id.value).toBe(commitmentId.value);
      expect(c2.state).toBe(CommitmentState.Completed);
      expect(c2.title.value).toBe(newTitle.value);
      expect(c2.description?.value).toBe(newDesc.value);
    });

    it('should throw InvalidCommitmentStateTransitionError on invalid transition loads', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        null
      );
      commitment.activate();
      commitment.pause();
      
      // Try to manually activate a paused commitment
      expect(() => commitment.activate()).toThrow(InvalidCommitmentStateTransitionError);
    });
  });

  describe('CommitmentRepository Contract', () => {
    it('should assert repository contract can be satisfied', async () => {
      let saved = false;
      let foundId: CommitmentId | null = null;

      const mockRepo: CommitmentRepository = {
        save: async (_commitment) => {
          saved = !!_commitment;
        },
        findById: async (id) => {
          foundId = id;
          return null;
        }
      };

      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(commitmentId, validIdentityId, validTitle, null);

      await mockRepo.save(commitment);
      const res = await mockRepo.findById(commitmentId);

      expect(saved).toBe(true);
      expect(foundId).toBe(commitmentId);
      expect(res).toBeNull();
    });
  });

  describe('Commitment State Transition Errors', () => {
    it('should instantiate transition errors correctly', () => {
      const err = new InvalidCommitmentStateTransitionError('Invalid transition from active to draft');
      expect(err.message).toBe('Invalid transition from active to draft');
      expect(err.code).toBe('INVALID_COMMITMENT_STATE_TRANSITION');

      const err2 = new CommitmentCannotBeRenamedError('Cannot rename completed commitment');
      expect(err2.message).toBe('Cannot rename completed commitment');
      expect(err2.code).toBe('COMMITMENT_CANNOT_BE_RENAMED');

      const err3 = new CommitmentCannotBeDescriptionUpdatedError('Cannot update description of completed commitment');
      expect(err3.message).toBe('Cannot update description of completed commitment');
      expect(err3.code).toBe('COMMITMENT_CANNOT_BE_DESCRIPTION_UPDATED');
    });
  });
});
