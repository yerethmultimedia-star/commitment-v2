/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { Session } from '@commitment/domain';
import type { SessionRepository } from '@commitment/domain';
import { LogoutHandler } from './logout.handler';
import { LogoutCommand } from './logout.command';

const SESSION_ID = '01911f9e-2f3b-7c3e-9c3e-4a1b2c3d4e5f';
const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';

describe('LogoutHandler', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: LogoutHandler;

  beforeEach(() => {
    sessionRepository = { save: jest.fn(), findById: jest.fn() };
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new LogoutHandler(sessionRepository, eventBus);
  });

  it('revokes an existing session', async () => {
    const session = Session.create(
      SESSION_ID,
      IDENTITY_ID,
      new Date(Date.now() + 100000),
    );
    session.clearUncommittedEvents();
    sessionRepository.findById.mockResolvedValue(session);

    await handler.execute(new LogoutCommand(SESSION_ID));

    expect(session.status.value).toBe('revoked');
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(session.getUncommittedEvents()).toHaveLength(0);
  });

  it('is idempotent — logging out a session that does not exist is a silent no-op', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new LogoutCommand(SESSION_ID)),
    ).resolves.toBeUndefined();
    expect(sessionRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('is idempotent — logging out an already-revoked session emits nothing new', async () => {
    const session = Session.create(
      SESSION_ID,
      IDENTITY_ID,
      new Date(Date.now() + 100000),
    );
    session.revoke();
    session.clearUncommittedEvents();
    sessionRepository.findById.mockResolvedValue(session);

    await handler.execute(new LogoutCommand(SESSION_ID));

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
