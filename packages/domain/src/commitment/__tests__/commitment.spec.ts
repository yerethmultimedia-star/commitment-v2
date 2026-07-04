import { Commitment, CommitmentState } from '../aggregate/commitment.js';
import { CommitmentId } from '../value-objects/commitment-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentTitle } from '../value-objects/commitment-title.js';
import { CommitmentDescription } from '../value-objects/commitment-description.js';
import { CommitmentConstraints } from '../constants/commitment-constraints.js';
import { CommitmentRepository } from '../repositories/commitment.repository.js';
import { CommitmentRegisteredEvent } from '../events/commitment-registered.event.js';
import { CommitmentActivatedEvent } from '../events/commitment-activated.event.js';
import {
  CommitmentAlreadyActiveError,
  CommitmentRequiresIdentityError,
  InvalidCommitmentTitleError,
  InvalidCommitmentDescriptionError,
  InvalidCommitmentStateTransitionError
} from '../errors/commitment-errors.js';

describe('Commitment Bounded Context', () => {
  const validIdentityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
  const validTitle = new CommitmentTitle('Learn Domain Driven Design');
  const validDescription = new CommitmentDescription('Read blue book and write aggregates');
  const occurredAt = new Date('2026-07-04T12:00:00Z');

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
        validDescription,
        occurredAt
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
      expect(registeredEvent.metadata.occurredAt).toBe(occurredAt.toISOString());
      expect(registeredEvent.payload.commitmentId).toBe(commitmentId.value);
      expect(registeredEvent.payload.identityId).toBe(validIdentityId.value);
      expect(registeredEvent.payload.title).toBe(validTitle.value);
      expect(registeredEvent.payload.description).toBe(validDescription.value);

      // Verify no timestamps inside payload
      expect('createdAt' in registeredEvent.payload).toBe(false);
      expect('occurredAt' in registeredEvent.payload).toBe(false);
    });

    it('should register with null/empty description correctly', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(
        commitmentId,
        validIdentityId,
        validTitle,
        null,
        occurredAt
      );

      expect(commitment.description).toBeNull();
      const uncommittedEvents = commitment.getUncommittedEvents();
      const registeredEvent = uncommittedEvents[0] as CommitmentRegisteredEvent;
      expect(registeredEvent.payload.description).toBe('');
    });

    it('should enforce aggregate entity equality based on ID', () => {
      const id = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const c1 = Commitment.register(id, validIdentityId, validTitle, null, occurredAt);
      const c2 = Commitment.register(id, validIdentityId, new CommitmentTitle('Different Title'), null, occurredAt);
      const c3 = Commitment.register(new CommitmentId('018f6b5c-42e1-7000-8000-888888888888'), validIdentityId, validTitle, null, occurredAt);

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
          validDescription,
          occurredAt
        )
      ).toThrow(CommitmentRequiresIdentityError);
    });

    it('should activate draft commitment and raise activated event', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const commitment = Commitment.register(
        commitmentId,
        validIdentityId,
        validTitle,
        validDescription,
        occurredAt
      );

      commitment.clearUncommittedEvents();

      const activateTime = new Date('2026-07-04T13:00:00Z');
      commitment.activate(activateTime);

      expect(commitment.state).toBe(CommitmentState.Active);

      const uncommittedEvents = commitment.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(1);

      const activatedEvent = uncommittedEvents[0] as CommitmentActivatedEvent;
      expect(activatedEvent).toBeDefined();
      expect(activatedEvent.name).toBe('commitment.activated');
      expect(activatedEvent.metadata.aggregateId).toBe(commitmentId.value);
      expect(activatedEvent.metadata.occurredAt).toBe(activateTime.toISOString());
      expect(activatedEvent.payload.commitmentId).toBe(commitmentId.value);

      // Verify no timestamps inside payload
      expect('updatedAt' in activatedEvent.payload).toBe(false);
      expect('occurredAt' in activatedEvent.payload).toBe(false);
    });

    it('should throw error when activating an already active commitment', () => {
      const commitment = Commitment.register(
        new CommitmentId('018f6b5c-42e1-7000-8000-999999999999'),
        validIdentityId,
        validTitle,
        validDescription,
        occurredAt
      );

      commitment.activate(occurredAt);

      expect(() => commitment.activate(new Date())).toThrow(CommitmentAlreadyActiveError);
    });

    it('should load state from historical event stream', () => {
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
      const c = Commitment.register(commitmentId, validIdentityId, validTitle, validDescription, occurredAt);
      c.activate(occurredAt);
      
      const events = [...c.getUncommittedEvents()];

      // Rehydrate new aggregate instance from stream
      const c2 = Commitment.register(
        commitmentId,
        validIdentityId,
        new CommitmentTitle('Dummy'),
        null,
        occurredAt
      );
      c2.loadFromHistory(events);

      expect(c2.id.value).toBe(commitmentId.value);
      expect(c2.state).toBe(CommitmentState.Active);
      expect(c2.title.value).toBe(validTitle.value);
      expect(c2.description?.value).toBe(validDescription.value);
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
      const commitment = Commitment.register(commitmentId, validIdentityId, validTitle, null, occurredAt);

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
    });
  });
});
