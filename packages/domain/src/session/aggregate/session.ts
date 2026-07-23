import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { SessionCreatedEvent } from '../events/session-created.event.js';
import { SessionRevokedEvent } from '../events/session-revoked.event.js';
import { SessionExpiredEvent } from '../events/session-expired.event.js';
import { SessionStatus, SessionStatusType } from '../value-objects/session-status.js';

/**
 * AR-043 D-043.1 — not fused with `Credential` (H-043.4, refuted: a Credential can have N
 * concurrent Sessions, one per device; fusing would make unrelated logins from different devices
 * contend on the same aggregate's optimistic-concurrency version, per AR-028). Persisted (H-043.6,
 * refuted the stateless-token alternative) — the token is never the source of truth, this is.
 */
export class Session extends AggregateRoot<string> {
  private _identityId!: string;
  private _status!: SessionStatus;
  private _expiresAt!: Date;
  private _createdAt!: Date;

  private constructor(id: string) {
    super(id);
  }

  public get identityId(): string {
    return this._identityId;
  }

  public get status(): SessionStatus {
    return this._status;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public static create(
    sessionId: string,
    identityId: string,
    expiresAt: Date,
    now: Date = new Date()
  ): Session {
    const session = new Session(sessionId);
    session.recordEvent(
      new SessionCreatedEvent(
        sessionId,
        { sessionId, identityId, expiresAt: expiresAt.toISOString() },
        now.toISOString()
      )
    );
    return session;
  }

  /** Invariant: Active only if not revoked and not past `expiresAt` (Paso 1/Paso 4). */
  public isValidAt(now: Date): boolean {
    return this._status.value === SessionStatusType.Active && this._expiresAt.getTime() > now.getTime();
  }

  /** Invariant: a revoked session never validates again — terminal, idempotent. */
  public revoke(now: Date = new Date()): void {
    if (this._status.value !== SessionStatusType.Active) {
      return;
    }
    this.recordEvent(
      new SessionRevokedEvent(this.id, { sessionId: this.id, identityId: this._identityId }, now.toISOString())
    );
  }

  /** Invariant: an expired session never reactivates — terminal, idempotent. Called by Validate
   * Session when it observes `expiresAt` has passed (Paso 1/6A: expiry is discovered, not swept). */
  public markExpired(now: Date = new Date()): void {
    if (this._status.value !== SessionStatusType.Active) {
      return;
    }
    this.recordEvent(
      new SessionExpiredEvent(this.id, { sessionId: this.id, identityId: this._identityId }, now.toISOString())
    );
  }

  /** Sliding expiration (Paso 6A: no Refresh Token — the same Session's `expiresAt` extends on
   * every successful Validate Session instead). Only a still-valid session can be extended. */
  public extend(newExpiresAt: Date, now: Date): void {
    if (!this.isValidAt(now)) {
      throw new Error('Cannot extend a session that is not currently valid');
    }
    this._expiresAt = newExpiresAt;
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'session.created') {
      const payload = (event as SessionCreatedEvent).payload;
      this._identityId = payload.identityId;
      this._expiresAt = new Date(payload.expiresAt);
      this._status = SessionStatus.active();
      this._createdAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'session.revoked') {
      this._status = SessionStatus.revoked();
    } else if (event.name === 'session.expired') {
      this._status = SessionStatus.expired();
    }
  }
}
