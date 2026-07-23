import { Credential } from '../aggregate/credential.js';
import { CredentialStatusType } from '../value-objects/credential-status.js';
import { CredentialRegisteredEvent } from '../events/credential-registered.event.js';
import { CredentialBlockedEvent } from '../events/credential-blocked.event.js';

describe('Credential Aggregate (AR-043)', () => {
  const credentialId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const identityId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const loginIdentifier = 'user@example.com';
  const credentialHash = 'stub:aGVsbG8=';
  const now = new Date('2026-07-23T00:00:00.000Z');

  it('registers a new credential, active by default, and emits credential.registered', () => {
    const credential = Credential.register(credentialId, identityId, loginIdentifier, credentialHash, now);

    expect(credential.id).toBe(credentialId);
    expect(credential.identityId).toBe(identityId);
    expect(credential.loginIdentifier).toBe(loginIdentifier);
    expect(credential.credentialHash).toBe(credentialHash);
    expect(credential.status.value).toBe(CredentialStatusType.Active);
    expect(credential.isActive).toBe(true);
    expect(credential.createdAt.getTime()).toBe(now.getTime());

    const events = credential.getUncommittedEvents();
    expect(events.length).toBe(1);
    const registered = events[0] as CredentialRegisteredEvent;
    expect(registered.name).toBe('credential.registered');
    expect(registered.payload.credentialId).toBe(credentialId);
    expect(registered.payload.identityId).toBe(identityId);
    expect(registered.payload.loginIdentifier).toBe(loginIdentifier);
  });

  it('never stores the raw secret — only credentialHash is a field on the aggregate', () => {
    const credential = Credential.register(credentialId, identityId, loginIdentifier, credentialHash, now);
    // The only secret-shaped property exposed is the hash; there is no `.secret` getter at all.
    expect((credential as unknown as { secret?: unknown }).secret).toBeUndefined();
    expect(credential.credentialHash).toBe(credentialHash);
  });

  it('invariant: a blocked credential never authenticates again', () => {
    const credential = Credential.register(credentialId, identityId, loginIdentifier, credentialHash, now);
    credential.clearUncommittedEvents();

    expect(credential.isActive).toBe(true);

    const blockedAt = new Date(now.getTime() + 1000);
    credential.block(blockedAt);

    expect(credential.isActive).toBe(false);
    expect(credential.status.value).toBe(CredentialStatusType.Blocked);

    const events = credential.getUncommittedEvents();
    expect(events.length).toBe(1);
    const blocked = events[0] as CredentialBlockedEvent;
    expect(blocked.name).toBe('credential.blocked');
    expect(blocked.payload.credentialId).toBe(credentialId);
    expect(blocked.payload.identityId).toBe(identityId);
  });

  it('block() is idempotent — blocking an already-blocked credential emits nothing new', () => {
    const credential = Credential.register(credentialId, identityId, loginIdentifier, credentialHash, now);
    credential.block(new Date(now.getTime() + 1000));
    credential.clearUncommittedEvents();

    credential.block(new Date(now.getTime() + 2000));

    expect(credential.isActive).toBe(false);
    expect(credential.getUncommittedEvents().length).toBe(0);
  });

  it('rehydrates from event history', () => {
    const credential = Credential.register(credentialId, identityId, loginIdentifier, credentialHash, now);
    credential.block(new Date(now.getTime() + 1000));
    const history = credential.getUncommittedEvents();

    const fresh = Credential.register(credentialId, 'dummy', 'dummy@dummy.com', 'dummy', new Date());
    fresh.clearUncommittedEvents();
    fresh.loadFromHistory(history);

    expect(fresh.identityId).toBe(identityId);
    expect(fresh.loginIdentifier).toBe(loginIdentifier);
    expect(fresh.isActive).toBe(false);
  });
});
