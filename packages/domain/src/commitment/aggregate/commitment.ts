import { AggregateRoot } from '../../shared/aggregate-root.js';
import { CommitmentId } from '../value-objects/commitment-id.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { CommitmentTitle } from '../value-objects/commitment-title.js';
import { CommitmentDescription } from '../value-objects/commitment-description.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { CommitmentRegisteredEvent } from '../events/commitment-registered.event.js';
import { CommitmentActivatedEvent } from '../events/commitment-activated.event.js';
import {
  CommitmentAlreadyActiveError,
  CommitmentRequiresIdentityError
} from '../errors/commitment-errors.js';

export enum CommitmentState {
  Draft = 'Draft',
  Active = 'Active'
}

export class Commitment extends AggregateRoot<CommitmentId> {
  private _identityId!: IdentityId;
  private _title!: CommitmentTitle;
  private _description!: CommitmentDescription | null;
  private _state!: CommitmentState;

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

  public static register(
    id: CommitmentId,
    identityId: IdentityId,
    title: CommitmentTitle,
    description: CommitmentDescription | null,
    occurredAt: Date
  ): Commitment {
    if (!identityId) {
      throw new CommitmentRequiresIdentityError();
    }
    const commitment = new Commitment(id);
    const event = new CommitmentRegisteredEvent(
      id.value,
      {
        commitmentId: id.value,
        identityId: identityId.value,
        title: title.value,
        description: description ? description.value : ''
      },
      occurredAt.toISOString()
    );
    commitment.recordEvent(event);
    return commitment;
  }

  public activate(occurredAt: Date): void {
    if (this._state === CommitmentState.Active) {
      throw new CommitmentAlreadyActiveError();
    }
    const event = new CommitmentActivatedEvent(
      this.id.value,
      {
        commitmentId: this.id.value
      },
      occurredAt.toISOString()
    );
    this.recordEvent(event);
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'commitment.registered') {
      const payload = (event as CommitmentRegisteredEvent).payload;
      this._identityId = new IdentityId(payload.identityId);
      this._title = new CommitmentTitle(payload.title);
      this._description = payload.description ? new CommitmentDescription(payload.description) : null;
      this._state = CommitmentState.Draft;
    } else if (event.name === 'commitment.activated') {
      this._state = CommitmentState.Active;
    }
  }
}
