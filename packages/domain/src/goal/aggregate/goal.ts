import { AggregateRoot } from '../../shared/aggregate-root.js';
import { GoalId } from '../value-objects/goal-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { GoalTitle } from '../value-objects/goal-title.js';
import { GoalDescription } from '../value-objects/goal-description.js';
import { CommitmentId } from '../../commitment/value-objects/commitment-id.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { GoalRegisteredEvent } from '../events/goal-registered.event.js';
import { GoalRenamedEvent } from '../events/goal-renamed.event.js';
import { GoalDescriptionUpdatedEvent } from '../events/goal-description-updated.event.js';
import { GoalActivatedEvent } from '../events/goal-activated.event.js';
import { GoalCompletedEvent } from '../events/goal-completed.event.js';
import { GoalArchivedEvent } from '../events/goal-archived.event.js';
import { GoalCommitmentLinkedEvent } from '../events/goal-commitment-linked.event.js';
import { GoalHabitLinkedEvent } from '../events/goal-habit-linked.event.js';
import {
  GoalRequiresIdentityError,
  GoalAlreadyCompletedError,
  GoalAlreadyArchivedError,
  InvalidGoalStateTransitionError,
  GoalActivationRequirementsNotMetError
} from '../errors/goal-errors.js';

/**
 * Goal — top-level Aggregate Root for the "what do I want to achieve"
 * layer of the product (VS-031 Product Experience Completion, Revision 2).
 *
 * Planning & Execution (Goal/Commitment/Task/Habit) is one bounded context /
 * shared kernel, not a strict layered hierarchy (ADR-025) — Goal -> Commitment
 * is one valid path, but Task and Habit may also link to Goal directly
 * (Task.goalId, Habit.goalId), exclusively with any Commitment link
 * (Task.relinkGoal()/relinkCommitment() enforce this). Commitment keeps its
 * own aggregate, events and persistence unchanged — Goal only records which
 * Commitment/habit ids belong to it, so existing Commitments become children
 * of a Goal without a schema change on the Commitment side. Milestone is
 * intentionally not modeled yet (see Phase 5 — Goals Workspace);
 * linkCommitment/linkHabit are the only relationships this phase needs.
 */
export enum GoalState {
  Draft,
  Active,
  Completed,
  Archived
}

export class Goal extends AggregateRoot<GoalId> {
  private _identityId!: IdentityId;
  private _title!: GoalTitle;
  private _description!: GoalDescription | null;
  private _state!: GoalState;
  private _commitmentIds!: string[];
  private _habitIds!: string[];
  private _completedAt!: string | null;

  private constructor(id: GoalId) {
    super(id);
  }

  public get identityId(): IdentityId {
    return this._identityId;
  }

  public get title(): GoalTitle {
    return this._title;
  }

  public get description(): GoalDescription | null {
    return this._description;
  }

  public get state(): GoalState {
    return this._state;
  }

  public get commitmentIds(): readonly string[] {
    return [...this._commitmentIds];
  }

  public get habitIds(): readonly string[] {
    return [...this._habitIds];
  }

  public get completedAt(): string | null {
    return this._completedAt;
  }

  public static register(
    id: GoalId,
    identityId: IdentityId,
    title: GoalTitle,
    description: GoalDescription | null
  ): Goal {
    if (!identityId) {
      throw new GoalRequiresIdentityError();
    }

    const goal = new Goal(id);
    const event = new GoalRegisteredEvent(
      id.value,
      {
        goalId: id.value,
        identityId: identityId.value,
        title: title.value,
        description: description ? description.value : ''
      }
    );
    goal.recordEvent(event);
    return goal;
  }

  public rename(newTitle: GoalTitle): void {
    this.ensureNotImmutable();
    if (newTitle.value === this._title.value) {
      return; // Rule #77 — No Meaningless Events
    }
    const event = new GoalRenamedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        title: newTitle.value
      }
    );
    this.recordEvent(event);
  }

  /**
   * Goal Draft Editing (follow-up to Decisión B, Goal Lifecycle): the only
   * way a Draft Goal's description invariant (activate()'s requirement) can
   * ever be satisfied for a Goal created via Quick Capture (title only, no
   * description) — mirrors Commitment.updateDescription() exactly.
   */
  public updateDescription(newDescription: GoalDescription | null): void {
    this.ensureNotImmutable();
    const currentVal = this._description ? this._description.value : '';
    const newVal = newDescription ? newDescription.value : '';
    if (currentVal === newVal) {
      return; // Rule #77 — No Meaningless Events
    }
    const event = new GoalDescriptionUpdatedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        description: newVal
      }
    );
    this.recordEvent(event);
  }

  public linkCommitment(commitmentId: CommitmentId): void {
    this.ensureNotImmutable();
    if (this._commitmentIds.includes(commitmentId.value)) {
      return; // Idempotent: already linked
    }
    const event = new GoalCommitmentLinkedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        commitmentId: commitmentId.value
      }
    );
    this.recordEvent(event);
  }

  public linkHabit(habitId: string): void {
    this.ensureNotImmutable();
    if (this._habitIds.includes(habitId)) {
      return; // Idempotent: already linked
    }
    const event = new GoalHabitLinkedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        habitId
      }
    );
    this.recordEvent(event);
  }

  /**
   * Draft -> Active (Decisión B, Goal Lifecycle). Title is guaranteed by
   * GoalTitle's own constructor and needs no runtime check here; description
   * and at least one linked Commitment are NOT guaranteed by register() (both
   * can be empty/absent), so they're the two real invariants enforced below.
   * Deliberately does NOT require targetDate/milestones/notes/attachments.
   */
  public activate(): void {
    if (this._state === GoalState.Active) {
      return; // Idempotent: already active, no state change or event
    }
    if (this._state !== GoalState.Draft) {
      this.ensureNotImmutable();
      throw new InvalidGoalStateTransitionError(`Cannot activate goal from state: ${GoalState[this._state]}`);
    }
    if (!this._description || this._description.value.length === 0) {
      throw new GoalActivationRequirementsNotMetError('Goal must have a description before it can be activated.');
    }
    if (this._commitmentIds.length === 0) {
      throw new GoalActivationRequirementsNotMetError('Goal must have at least one linked Commitment before it can be activated.');
    }
    const event = new GoalActivatedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        identityId: this._identityId.value
      }
    );
    this.recordEvent(event);
  }

  public complete(): void {
    if (this._state === GoalState.Completed) {
      return; // Idempotent
    }
    // Decisión B, Goal Lifecycle: Draft can no longer complete directly —
    // it must go through Active first (activate()).
    if (this._state !== GoalState.Active) {
      this.ensureNotImmutable();
      throw new InvalidGoalStateTransitionError(`Cannot complete goal from state: ${GoalState[this._state]}`);
    }
    const event = new GoalCompletedEvent(
      this.id.value,
      {
        goalId: this.id.value,
        identityId: this._identityId.value,
        title: this._title.value,
        completedAt: new Date().toISOString()
      }
    );
    this.recordEvent(event);
  }

  public archive(): void {
    if (this._state === GoalState.Archived) {
      return; // Idempotent
    }
    const event = new GoalArchivedEvent(
      this.id.value,
      {
        goalId: this.id.value
      }
    );
    this.recordEvent(event);
  }

  private ensureNotImmutable(): void {
    if (this._state === GoalState.Completed) {
      throw new GoalAlreadyCompletedError();
    }
    if (this._state === GoalState.Archived) {
      throw new GoalAlreadyArchivedError();
    }
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'goal.registered') {
      const payload = (event as GoalRegisteredEvent).payload;
      this._identityId = new IdentityId(payload.identityId);
      this._title = new GoalTitle(payload.title);
      this._description = payload.description ? new GoalDescription(payload.description) : null;
      this._state = GoalState.Draft;
      this._commitmentIds = [];
      this._habitIds = [];
      this._completedAt = null;
    } else if (event.name === 'goal.renamed') {
      const payload = (event as GoalRenamedEvent).payload;
      this._title = new GoalTitle(payload.title);
    } else if (event.name === 'goal.description_updated') {
      const payload = (event as GoalDescriptionUpdatedEvent).payload;
      this._description = payload.description ? new GoalDescription(payload.description) : null;
    } else if (event.name === 'goal.commitment_linked') {
      const payload = (event as GoalCommitmentLinkedEvent).payload;
      this._commitmentIds = [...this._commitmentIds, payload.commitmentId];
    } else if (event.name === 'goal.habit_linked') {
      const payload = (event as GoalHabitLinkedEvent).payload;
      this._habitIds = [...this._habitIds, payload.habitId];
    } else if (event.name === 'goal.activated') {
      this._state = GoalState.Active;
    } else if (event.name === 'goal.completed') {
      const payload = (event as GoalCompletedEvent).payload;
      this._state = GoalState.Completed;
      this._completedAt = payload.completedAt;
    } else if (event.name === 'goal.archived') {
      this._state = GoalState.Archived;
    }
  }
}
