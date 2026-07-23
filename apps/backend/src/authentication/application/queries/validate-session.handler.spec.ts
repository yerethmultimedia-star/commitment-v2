/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { Session } from '@commitment/domain';
import type { SessionRepository } from '@commitment/domain';
import { ValidateSessionHandler } from './validate-session.handler';
import { ValidateSessionQuery } from './validate-session.query';
import type { TokenServicePort } from '../ports/token-service.port';

const SESSION_ID = '01911f9e-2f3b-7c3e-9c3e-4a1b2c3d4e5f';
const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';
const TOKEN = 'some-opaque-token';

describe('ValidateSessionHandler', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: ValidateSessionHandler;

  beforeEach(() => {
    sessionRepository = { save: jest.fn(), findById: jest.fn() };
    tokenService = { issue: jest.fn(), verify: jest.fn() };
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new ValidateSessionHandler(
      sessionRepository,
      tokenService,
      eventBus,
    );
  });

  it('returns null when the token itself does not verify — the handler never inspects the token format', async () => {
    tokenService.verify.mockResolvedValue(null);

    const result = await handler.execute(new ValidateSessionQuery(TOKEN));

    expect(result).toBeNull();
    expect(tokenService.verify).toHaveBeenCalledWith(TOKEN);
    expect(sessionRepository.findById).not.toHaveBeenCalled();
  });

  it('returns null when the referenced session does not exist', async () => {
    tokenService.verify.mockResolvedValue({
      sessionId: SESSION_ID,
      identityId: IDENTITY_ID,
    });
    sessionRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(new ValidateSessionQuery(TOKEN));

    expect(result).toBeNull();
  });

  it('returns null for a revoked session, without resurrecting it', async () => {
    const session = Session.create(
      SESSION_ID,
      IDENTITY_ID,
      new Date(Date.now() + 100000),
    );
    session.revoke();
    session.clearUncommittedEvents();
    tokenService.verify.mockResolvedValue({
      sessionId: SESSION_ID,
      identityId: IDENTITY_ID,
    });
    sessionRepository.findById.mockResolvedValue(session);

    const result = await handler.execute(new ValidateSessionQuery(TOKEN));

    expect(result).toBeNull();
    expect(sessionRepository.save).not.toHaveBeenCalled(); // no markExpired path for an already-terminal session
  });

  it('marks an Active-but-past-expiry session as Expired and returns null', async () => {
    const session = Session.create(
      SESSION_ID,
      IDENTITY_ID,
      new Date(Date.now() - 1000),
    );
    session.clearUncommittedEvents();
    tokenService.verify.mockResolvedValue({
      sessionId: SESSION_ID,
      identityId: IDENTITY_ID,
    });
    sessionRepository.findById.mockResolvedValue(session);

    const result = await handler.execute(new ValidateSessionQuery(TOKEN));

    expect(result).toBeNull();
    expect(session.status.value).toBe('expired');
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });

  it('returns the identityId and extends expiry (sliding expiration, Paso 6A) for a valid session', async () => {
    const originalExpiry = new Date(Date.now() + 1000);
    const session = Session.create(SESSION_ID, IDENTITY_ID, originalExpiry);
    session.clearUncommittedEvents();
    tokenService.verify.mockResolvedValue({
      sessionId: SESSION_ID,
      identityId: IDENTITY_ID,
    });
    sessionRepository.findById.mockResolvedValue(session);

    const result = await handler.execute(new ValidateSessionQuery(TOKEN));

    expect(result).toEqual({ identityId: IDENTITY_ID, sessionId: SESSION_ID });
    expect(session.expiresAt.getTime()).toBeGreaterThan(
      originalExpiry.getTime(),
    );
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
  });
});
