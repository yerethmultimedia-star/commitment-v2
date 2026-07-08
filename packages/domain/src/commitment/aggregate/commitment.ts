import { AggregateRoot } from '../../shared/aggregate-root.js';
import { CommitmentId } from '../value-objects/commitment-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentTitle } from '../value-objects/commitment-title.js';
import { CommitmentDescription } from '../value-objects/commitment-description.js';
import { RecurrencePattern, RecurrenceType } from '../value-objects/recurrence-pattern.js';
import { SeriesId } from '../value-objects/series-id.js';
import { TargetDate } from '../value-objects/target-date.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { CommitmentRegisteredEvent } from '../events/commitment-registered.event.js';
import { CommitmentActivatedEvent } from '../events/commitment-activated.event.js';
import { CommitmentPausedEvent } from '../events/commitment-paused.event.js';
import { CommitmentResumedEvent } from '../events/commitment-resumed.event.js';
import { CommitmentCancelledEvent } from '../events/commitment-cancelled.event.js';
import { CommitmentCompletedEvent } from '../events/commitment-completed.event.js';
import { CommitmentRenamedEvent } from '../events/commitment-renamed.event.js';
import { CommitmentDescriptionUpdatedEvent } from '../events/commitment-description-updated.event.js';
import {
  CommitmentRequiresIdentityError,
  CommitmentAlreadyCompletedError,
  CommitmentAlreadyCancelledError,
  CommitmentCannotBePausedError,
  CommitmentCannotBeResumedError,
  CommitmentCannotBeCompletedError,
  InvalidCommitmentStateTransitionError
} from '../errors/commitment-errors.js';

export enum CommitmentState {
  Draft,
  Active,
  Paused,
  Completed,
  Cancelled
}

export class Commitment extends AggregateRoot<CommitmentId> {
  private _identityId!: IdentityId;
  private _title!: CommitmentTitle;
  private _description!: CommitmentDescription | null;
  private _state!: CommitmentState;
  private _recurrencePattern!: RecurrencePattern;
  private _targetDate!: TargetDate | null;
  private _seriesId!: SeriesId;

  private constructor(id: CommitmentId) {
    super(id);
  }

  public get identityId(): IdentityId {
    return this._identityId;
  }

  public get title(): CommitmentTitle {
    return this._title;
  }

  public get description(): CommitmentDescription | null {
    return this._description;
  }

  public get state(): CommitmentState {
    return this._state;
  }

  public get recurrencePattern(): RecurrencePattern {
    return this._recurrencePattern;
  }

  public get targetDate(): TargetDate | null {
    return this._targetDate;
  }

  public get seriesId(): SeriesId {
    return this._seriesId;
  }

  public static register(
    id: CommitmentId,
    identityId: IdentityId,
    title: CommitmentTitle,
    description: CommitmentDescription | null,
    recurrencePattern?: RecurrencePattern,
    targetDate?: TargetDate | null,
    seriesId?: SeriesId
  ): Commitment {
    if (!identityId) {
      throw new CommitmentRequiresIdentityError();
    }
    const pattern = recurrencePattern ?? RecurrencePattern.create(RecurrenceType.None);
    const sId = seriesId ?? SeriesId.create(id.value);
    const tDate = targetDate ?? null;

    const commitment = new Commitment(id);
    const event = new CommitmentRegisteredEvent(
      id.value,
      {
        commitmentId: id.value,
        identityId: identityId.value,
        title: title.value,
        description: description ? description.value : '',
        recurrencePattern: pattern.type,
        targetDate: tDate ? tDate.toISOString() : undefined,
        seriesId: sId.value
      }
    );
    commitment.recordEvent(event);
    return commitment;
  }

  public activate(): void {
    if (this._state === CommitmentState.Active) {
      // Idempotent: already active, no state change or event
      return;
    }
    if (this._state !== CommitmentState.Draft) {
      this.ensureNotImmutable();
      throw new InvalidCommitmentStateTransitionError(`Cannot activate commitment from state: ${CommitmentState[this._state]}`);
    }
    const event = new CommitmentActivatedEvent(
      this.id.value,
      {
        commitmentId: this.id.value
      }
    );
    this.recordEvent(event);
  }

  public pause(): void {
    if (this._state === CommitmentState.Paused) {
      // Idempotent: already paused, no state change or event
      return;
    }
    if (this._state !== CommitmentState.Active) {
      this.ensureNotImmutable();
      throw new CommitmentCannotBePausedError(`Cannot pause commitment from state: ${CommitmentState[this._state]}`);
    }
    const event = new CommitmentPausedEvent(
      this.id.value,
      {
        commitmentId: this.id.value
      }
    );
    this.recordEvent(event);
  }

  public resume(): void {
    if (this._state === CommitmentState.Active) {
      // Idempotent: already active, no state change or event
      return;
    }
    if (this._state !== CommitmentState.Paused) {
      this.ensureNotImmutable();
      throw new CommitmentCannotBeResumedError(`Cannot resume commitment from state: ${CommitmentState[this._state]}`);
    }
    const event = new CommitmentResumedEvent(
      this.id.value,
      {
        commitmentId: this.id.value
      }
    );
    this.recordEvent(event);
  }

  public cancel(): void {
    if (this._state === CommitmentState.Cancelled) {
      // Idempotent: already cancelled, no state change or event
      return;
    }
    this.ensureNotImmutable();
    const event = new CommitmentCancelledEvent(
      this.id.value,
      {
        commitmentId: this.id.value
      }
    );
    this.recordEvent(event);
  }

  public complete(): void {
    if (this._state === CommitmentState.Completed) {
      // Idempotent: already completed, no state change or event
      return;
    }
    if (this._state !== CommitmentState.Active && this._state !== CommitmentState.Paused) {
      this.ensureNotImmutable();
      throw new CommitmentCannotBeCompletedError(`Cannot complete commitment from state: ${CommitmentState[this._state]}`);
    }
    const event = new CommitmentCompletedEvent(
      this.id.value,
      {
        commitmentId: this.id.value,
        identityId: this._identityId.value,
        title: this._title.value,
        description: this._description ? this._description.value : '',
        recurrencePattern: this._recurrencePattern.type,
        targetDate: this._targetDate ? this._targetDate.toISOString() : undefined,
        seriesId: this._seriesId.value
      }
    );
    this.recordEvent(event);
  }

  public rename(newTitle: CommitmentTitle): void {
    this.ensureNotImmutable();
    if (newTitle.value === this._title.value) {
      return; // Rule #77 — No Meaningless Events
    }
    const event = new CommitmentRenamedEvent(
      this.id.value,
      {
        commitmentId: this.id.value,
        title: newTitle.value
      }
    );
    this.recordEvent(event);
  }

  public updateDescription(newDescription: CommitmentDescription | null): void {
    this.ensureNotImmutable();
    const currentVal = this._description ? this._description.value : '';
    const newVal = newDescription ? newDescription.value : '';
    if (currentVal === newVal) {
      return; // Rule #77 — No Meaningless Events
    }
    const event = new CommitmentDescriptionUpdatedEvent(
      this.id.value,
      {
        commitmentId: this.id.value,
        description: newVal
      }
    );
    this.recordEvent(event);
  }

  private ensureNotImmutable(): void {
    if (this._state === CommitmentState.Completed) {
      throw new CommitmentAlreadyCompletedError();
    }
    if (this._state === CommitmentState.Cancelled) {
      throw new CommitmentAlreadyCancelledError();
    }
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'commitment.registered') {
      const payload = (event as CommitmentRegisteredEvent).payload;
      this._identityId = new IdentityId(payload.identityId);
      this._title = new CommitmentTitle(payload.title);
      this._description = payload.description ? new CommitmentDescription(payload.description) : null;
      this._state = CommitmentState.Draft;
      this._recurrencePattern = RecurrencePattern.create(payload.recurrencePattern as RecurrenceType);
      this._targetDate = payload.targetDate ? TargetDate.create(payload.targetDate) : null;
      this._seriesId = SeriesId.create(payload.seriesId);
    } else if (event.name === 'commitment.activated') {
      this._state = CommitmentState.Active;
    } else if (event.name === 'commitment.paused') {
      this._state = CommitmentState.Paused;
    } else if (event.name === 'commitment.resumed') {
      this._state = CommitmentState.Active;
    } else if (event.name === 'commitment.cancelled') {
      this._state = CommitmentState.Cancelled;
    } else if (event.name === 'commitment.completed') {
      this._state = CommitmentState.Completed;
    } else if (event.name === 'commitment.renamed') {
      const payload = (event as CommitmentRenamedEvent).payload;
      this._title = new CommitmentTitle(payload.title);
    } else if (event.name === 'commitment.description_updated') {
      const payload = (event as CommitmentDescriptionUpdatedEvent).payload;
      this._description = payload.description ? new CommitmentDescription(payload.description) : null;
    }
  }
}
