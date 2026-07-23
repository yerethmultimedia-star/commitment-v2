import { Session } from '../aggregate/session.js';
import { SessionStatusType } from '../value-objects/session-status.js';
import { SessionCreatedEvent } from '../events/session-created.event.js';
import { SessionRevokedEvent } from '../events/session-revoked.event.js';
import { SessionExpiredEvent } from '../events/session-expired.event.js';

describe('Session Aggregate (AR-043)', () => {
  const sessionId = '01911f9e-2f3b-7c3e-9c3e-4a1b2c3d4e5f';
  const identityId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const now = new Date('2026-07-23T00:00:00.000Z');
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  it('creates an active session belonging to one identity and emits session.created', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);

    expect(session.id).toBe(sessionId);
    expect(session.identityId).toBe(identityId);
    expect(session.status.value).toBe(SessionStatusType.Active);
    expect(session.expiresAt.getTime()).toBe(expiresAt.getTime());
    expect(session.isValidAt(now)).toBe(true);

    const events = session.getUncommittedEvents();
    expect(events.length).toBe(1);
    const created = events[0] as SessionCreatedEvent;
    expect(created.name).toBe('session.created');
    expect(created.payload.sessionId).toBe(sessionId);
    expect(created.payload.identityId).toBe(identityId);
  });

  it('invariant: a revoked session never validates again, and revoke() is idempotent', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);
    session.clearUncommittedEvents();

    session.revoke(new Date(now.getTime() + 1000));

    expect(session.status.value).toBe(SessionStatusType.Revoked);
    expect(session.isValidAt(new Date(now.getTime() + 2000))).toBe(false);

    const events = session.getUncommittedEvents();
    expect(events.length).toBe(1);
    expect((events[0] as SessionRevokedEvent).name).toBe('session.revoked');

    session.clearUncommittedEvents();
    session.revoke(new Date(now.getTime() + 3000));
    expect(session.getUncommittedEvents().length).toBe(0); // idempotent, no double-revoke
  });

  it('invariant: an expired session never reactivates, and markExpired() is idempotent', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);
    session.clearUncommittedEvents();

    const afterExpiry = new Date(expiresAt.getTime() + 1000);
    expect(session.isValidAt(afterExpiry)).toBe(false);

    session.markExpired(afterExpiry);
    expect(session.status.value).toBe(SessionStatusType.Expired);

    const events = session.getUncommittedEvents();
    expect(events.length).toBe(1);
    expect((events[0] as SessionExpiredEvent).name).toBe('session.expired');

    session.clearUncommittedEvents();
    session.markExpired(new Date(afterExpiry.getTime() + 1000));
    expect(session.getUncommittedEvents().length).toBe(0); // idempotent

    // Terminal: extend() must refuse to reactivate an expired session
    expect(() => session.extend(new Date(afterExpiry.getTime() + 1000 * 60), afterExpiry)).toThrow();
  });

  it('markExpired() does not override an already-revoked session (revoked stays terminal)', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);
    session.revoke(new Date(now.getTime() + 1000));
    session.clearUncommittedEvents();

    session.markExpired(new Date(expiresAt.getTime() + 1000));

    expect(session.status.value).toBe(SessionStatusType.Revoked);
    expect(session.getUncommittedEvents().length).toBe(0);
  });

  it('sliding expiration: extend() only succeeds on a currently-valid session (Paso 6A — no Refresh Token)', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);
    const validationTime = new Date(now.getTime() + 1000);
    const newExpiry = new Date(validationTime.getTime() + 1000 * 60 * 60 * 24 * 30);

    session.extend(newExpiry, validationTime);

    expect(session.expiresAt.getTime()).toBe(newExpiry.getTime());
    expect(session.isValidAt(validationTime)).toBe(true);
  });

  it('rehydrates from event history', () => {
    const session = Session.create(sessionId, identityId, expiresAt, now);
    session.revoke(new Date(now.getTime() + 1000));
    const history = session.getUncommittedEvents();

    const fresh = Session.create(sessionId, 'dummy', new Date(), new Date());
    fresh.clearUncommittedEvents();
    fresh.loadFromHistory(history);

    expect(fresh.identityId).toBe(identityId);
    expect(fresh.status.value).toBe(SessionStatusType.Revoked);
  });
});
