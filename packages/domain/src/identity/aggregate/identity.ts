import { AggregateRoot } from '../../shared/aggregate-root.js';
import { IdentityId } from '../value-objects/identity-id.js';
import { Email } from '../../shared/primitives/email.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PreferredLanguage } from '../value-objects/preferred-language.js';
import { PreferredTimeZone } from '../value-objects/preferred-time-zone.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { IdentityCreatedEvent } from '../events/identity-created.event.js';
import { IdentityUpdatedEvent } from '../events/identity-updated.event.js';

export class Identity extends AggregateRoot<IdentityId> {
  private _email!: Email;
  private _displayName!: DisplayName;
  private _preferredLanguage!: PreferredLanguage;
  private _preferredTimeZone!: PreferredTimeZone;
  private _createdAt!: Date;
  private _updatedAt!: Date;

  private constructor(id: IdentityId) {
    super(id);
  }

  public get email(): Email {
    return this._email;
  }

  public get displayName(): DisplayName {
    return this._displayName;
  }

  public get preferredLanguage(): PreferredLanguage {
    return this._preferredLanguage;
  }

  public get preferredTimeZone(): PreferredTimeZone {
    return this._preferredTimeZone;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static register(
    id: IdentityId,
    email: Email,
    displayName: DisplayName,
    preferredLanguage: PreferredLanguage,
    preferredTimeZone: PreferredTimeZone,
    occurredAt: Date
  ): Identity {
    const identity = new Identity(id);
    const event = new IdentityCreatedEvent(
      id.value,
      {
        identityId: id.value,
        email: email.value,
        displayName: displayName.value,
        preferredLanguage: preferredLanguage.code,
        preferredTimeZone: preferredTimeZone.name
      },
      occurredAt.toISOString()
    );
    identity.recordEvent(event);
    return identity;
  }

  public update(
    displayName: DisplayName,
    preferredLanguage: PreferredLanguage,
    preferredTimeZone: PreferredTimeZone,
    occurredAt: Date
  ): void {
    const event = new IdentityUpdatedEvent(
      this.id.value,
      {
        identityId: this.id.value,
        displayName: displayName.value,
        preferredLanguage: preferredLanguage.code,
        preferredTimeZone: preferredTimeZone.name
      },
      occurredAt.toISOString()
    );
    this.recordEvent(event);
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'identity.created') {
      const payload = (event as IdentityCreatedEvent).payload;
      this._email = new Email(payload.email);
      this._displayName = new DisplayName(payload.displayName);
      this._preferredLanguage = new PreferredLanguage(payload.preferredLanguage);
      this._preferredTimeZone = new PreferredTimeZone(payload.preferredTimeZone);
      this._createdAt = new Date(event.metadata.occurredAt);
      this._updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'identity.updated') {
      const payload = (event as IdentityUpdatedEvent).payload;
      this._displayName = new DisplayName(payload.displayName);
      this._preferredLanguage = new PreferredLanguage(payload.preferredLanguage);
      this._preferredTimeZone = new PreferredTimeZone(payload.preferredTimeZone);
      this._updatedAt = new Date(event.metadata.occurredAt);
    }
  }
}
