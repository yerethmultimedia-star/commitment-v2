import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { CredentialRegisteredEvent } from '../events/credential-registered.event.js';
import { CredentialBlockedEvent } from '../events/credential-blocked.event.js';
import { CredentialStatus, CredentialStatusType } from '../value-objects/credential-status.js';

/**
 * AR-043 D-043.1 — Authentication bounded context, deliberately independent of the `Identity`
 * aggregate. Demonstrates that an identity knows a valid secret; carries no profile data.
 *
 * `loginIdentifier` (AR-043 Fase 4B gap-fill, not in the original Paso 1 field list): Credential
 * needs its own lookup key for Login, without depending on the `Identity` aggregate/repository
 * (Fase 1/Paso 5 already established zero coupling to `Identity`). This is Auth's own copy of an
 * identifying string (e.g. an email), independent of whatever `Identity` stores under the same name.
 */
export class Credential extends AggregateRoot<string> {
  private _identityId!: string;
  private _loginIdentifier!: string;
  private _credentialHash!: string;
  private _status!: CredentialStatus;
  private _createdAt!: Date;
  private _updatedAt!: Date;

  private constructor(id: string) {
    super(id);
  }

  public get identityId(): string {
    return this._identityId;
  }

  public get loginIdentifier(): string {
    return this._loginIdentifier;
  }

  public get credentialHash(): string {
    return this._credentialHash;
  }

  public get status(): CredentialStatus {
    return this._status;
  }

  public get isActive(): boolean {
    return this._status.value === CredentialStatusType.Active;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static register(
    credentialId: string,
    identityId: string,
    loginIdentifier: string,
    credentialHash: string,
    now: Date = new Date()
  ): Credential {
    const credential = new Credential(credentialId);
    credential.recordEvent(
      new CredentialRegisteredEvent(
        credentialId,
        { credentialId, identityId, loginIdentifier },
        now.toISOString()
      )
    );
    // `credentialHash` never travels inside the event payload's persisted history in this
    // minimal model — it's set directly here, alongside event recording, not derived from it.
    credential._credentialHash = credentialHash;
    return credential;
  }

  /** Invariant: a blocked credential never authenticates again (Paso 1). Idempotent. */
  public block(now: Date = new Date()): void {
    if (this._status.value === CredentialStatusType.Blocked) {
      return;
    }
    this.recordEvent(
      new CredentialBlockedEvent(
        this.id,
        { credentialId: this.id, identityId: this._identityId },
        now.toISOString()
      )
    );
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'credential.registered') {
      const payload = (event as CredentialRegisteredEvent).payload;
      this._identityId = payload.identityId;
      this._loginIdentifier = payload.loginIdentifier;
      this._status = CredentialStatus.active();
      this._createdAt = new Date(event.metadata.occurredAt);
      this._updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'credential.blocked') {
      this._status = CredentialStatus.blocked();
      this._updatedAt = new Date(event.metadata.occurredAt);
    }
  }
}
