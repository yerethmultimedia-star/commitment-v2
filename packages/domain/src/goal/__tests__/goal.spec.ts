import { Goal, GoalState } from '../aggregate/goal.js';
import { GoalId } from '../value-objects/goal-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { GoalTitle } from '../value-objects/goal-title.js';
import { GoalDescription } from '../value-objects/goal-description.js';
import { CommitmentId } from '../../commitment/value-objects/commitment-id.js';
import {
  GoalRequiresIdentityError,
  InvalidGoalTitleError,
  InvalidGoalDescriptionError,
  GoalAlreadyCompletedError,
  GoalAlreadyArchivedError,
  GoalActivationRequirementsNotMetError,
  InvalidGoalStateTransitionError
} from '../errors/goal-errors.js';

describe('Goal Bounded Context', () => {
  const validIdentityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
  const validTitle = new GoalTitle('Run a marathon');
  const validDescription = new GoalDescription('Train consistently for six months');

  const newGoalId = () => new GoalId('018f6b5c-42e1-7000-8000-222222222222');

  describe('Value Objects', () => {
    it('GoalTitle trims whitespace and rejects empty values', () => {
      expect(new GoalTitle('  Run a marathon  ').value).toBe('Run a marathon');
      expect(() => new GoalTitle('')).toThrow(InvalidGoalTitleError);
      expect(() => new GoalTitle('   ')).toThrow(InvalidGoalTitleError);
    });

    it('GoalDescription rejects values over the max length', () => {
      expect(() => new GoalDescription('x'.repeat(1001))).toThrow(InvalidGoalDescriptionError);
    });
  });

  describe('register', () => {
    it('creates a Draft goal and records a GoalRegisteredEvent', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);

      expect(goal.state).toBe(GoalState.Draft);
      expect(goal.title.value).toBe('Run a marathon');
      expect(goal.commitmentIds).toEqual([]);
      expect(goal.habitIds).toEqual([]);
      expect(goal.getUncommittedEvents()).toHaveLength(1);
      expect(goal.getUncommittedEvents()[0]?.name).toBe('goal.registered');
    });

    it('throws without a valid identity', () => {
      expect(() => Goal.register(newGoalId(), null as any, validTitle, validDescription))
        .toThrow(GoalRequiresIdentityError);
    });
  });

  describe('linkCommitment', () => {
    it('links a Commitment without touching the Commitment aggregate', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-333333333333');

      goal.linkCommitment(commitmentId);

      expect(goal.commitmentIds).toEqual([commitmentId.value]);
    });

    it('is idempotent when linking the same commitment twice', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-333333333333');

      goal.linkCommitment(commitmentId);
      goal.linkCommitment(commitmentId);

      expect(goal.commitmentIds).toEqual([commitmentId.value]);
    });
  });

  describe('linkHabit', () => {
    it('links a habit id', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);

      goal.linkHabit('habit-123');

      expect(goal.habitIds).toEqual(['habit-123']);
    });
  });

  describe('updateDescription', () => {
    it('does not record an event when the description is unchanged (Rule #77)', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.clearUncommittedEvents();

      goal.updateDescription(new GoalDescription('Train consistently for six months'));

      expect(goal.getUncommittedEvents()).toHaveLength(0);
    });

    it('records a GoalDescriptionUpdatedEvent when the description changes', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, null);
      goal.clearUncommittedEvents();

      goal.updateDescription(new GoalDescription('A brand new description'));

      expect(goal.description?.value).toBe('A brand new description');
      expect(goal.getUncommittedEvents()).toHaveLength(1);
      expect(goal.getUncommittedEvents()[0]?.name).toBe('goal.description_updated');
    });

    it('allows clearing the description back to null', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);

      goal.updateDescription(null);

      expect(goal.description).toBeNull();
    });

    it('rejects updates after completion or archiving', () => {
      const completedGoal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      completedGoal.linkCommitment(new CommitmentId('018f6b5c-42e1-7000-8000-333333333333'));
      completedGoal.activate();
      completedGoal.complete();
      expect(() => completedGoal.updateDescription(new GoalDescription('New'))).toThrow(GoalAlreadyCompletedError);

      const archivedGoal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      archivedGoal.archive();
      expect(() => archivedGoal.updateDescription(new GoalDescription('New'))).toThrow(GoalAlreadyArchivedError);
    });

    it('unblocks activate() for a Goal that was registered without a description', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, null);
      const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-333333333333');
      goal.linkCommitment(commitmentId);

      expect(() => goal.activate()).toThrow(GoalActivationRequirementsNotMetError);

      goal.updateDescription(new GoalDescription('Filled in during Draft'));

      expect(() => goal.activate()).not.toThrow();
      expect(goal.state).toBe(GoalState.Active);
    });
  });

  describe('activate', () => {
    const linkedCommitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-333333333333');

    it('activates a Draft goal that has a description and a linked Commitment', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.linkCommitment(linkedCommitmentId);
      goal.clearUncommittedEvents();

      goal.activate();

      expect(goal.state).toBe(GoalState.Active);
      expect(goal.getUncommittedEvents()).toHaveLength(1);
      expect(goal.getUncommittedEvents()[0]?.name).toBe('goal.activated');
    });

    it('rejects activation without a description', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, null);
      goal.linkCommitment(linkedCommitmentId);

      expect(() => goal.activate()).toThrow(GoalActivationRequirementsNotMetError);
    });

    it('rejects activation without at least one linked Commitment', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);

      expect(() => goal.activate()).toThrow(GoalActivationRequirementsNotMetError);
    });

    it('is idempotent when activating twice', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.linkCommitment(linkedCommitmentId);
      goal.activate();

      expect(() => goal.activate()).not.toThrow();
      expect(goal.state).toBe(GoalState.Active);
    });

    it('rejects activating a Completed or Archived goal', () => {
      const completedGoal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      completedGoal.linkCommitment(linkedCommitmentId);
      completedGoal.activate();
      completedGoal.complete();
      expect(() => completedGoal.activate()).toThrow(GoalAlreadyCompletedError);

      const archivedGoal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      archivedGoal.archive();
      expect(() => archivedGoal.activate()).toThrow(GoalAlreadyArchivedError);
    });
  });

  describe('lifecycle', () => {
    const linkedCommitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-333333333333');

    it('completes an active goal', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.linkCommitment(linkedCommitmentId);
      goal.activate();
      goal.complete();
      expect(goal.state).toBe(GoalState.Completed);
      expect(goal.completedAt).not.toBeNull();
      expect(new Date(goal.completedAt as string).toString()).not.toBe('Invalid Date');
    });

    it('has a null completedAt before completion', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      expect(goal.completedAt).toBeNull();
    });

    it('rejects completing a Draft goal directly (must activate first)', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      expect(() => goal.complete()).toThrow(InvalidGoalStateTransitionError);
    });

    it('is idempotent when completing twice', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.linkCommitment(linkedCommitmentId);
      goal.activate();
      goal.complete();
      expect(() => goal.complete()).not.toThrow();
    });

    it('rejects mutations after completion', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.linkCommitment(linkedCommitmentId);
      goal.activate();
      goal.complete();
      expect(() => goal.rename(new GoalTitle('New title'))).toThrow(GoalAlreadyCompletedError);
    });

    it('archives a goal and rejects mutations after archiving', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.archive();
      expect(goal.state).toBe(GoalState.Archived);
      expect(() => goal.rename(new GoalTitle('New title'))).toThrow(GoalAlreadyArchivedError);
    });
  });

  describe('rename', () => {
    it('does not record an event when the title is unchanged (Rule #77)', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.clearUncommittedEvents();

      goal.rename(new GoalTitle('Run a marathon'));

      expect(goal.getUncommittedEvents()).toHaveLength(0);
    });

    it('records a GoalRenamedEvent when the title changes', () => {
      const goal = Goal.register(newGoalId(), validIdentityId, validTitle, validDescription);
      goal.clearUncommittedEvents();

      goal.rename(new GoalTitle('Run a full marathon'));

      expect(goal.title.value).toBe('Run a full marathon');
      expect(goal.getUncommittedEvents()).toHaveLength(1);
      expect(goal.getUncommittedEvents()[0]?.name).toBe('goal.renamed');
    });
  });
});
