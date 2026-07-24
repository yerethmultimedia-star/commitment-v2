/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { RegisterIdentityHandler } from './register-identity.handler';
import { RegisterIdentityCommand } from './register-identity.command';
import type { IdentityRepository } from '@commitment/domain';

const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';
const EMAIL = 'user@example.com';
const DISPLAY_NAME = 'Alice Smith';
const PREFERRED_LANGUAGE = 'en';
const PREFERRED_TIME_ZONE = 'UTC';

describe('RegisterIdentityHandler', () => {
  let repository: jest.Mocked<IdentityRepository>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: RegisterIdentityHandler;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new RegisterIdentityHandler(repository, eventBus);
  });

  it('builds the Identity aggregate from its own value objects and persists it', async () => {
    await handler.execute(
      new RegisterIdentityCommand(
        IDENTITY_ID,
        EMAIL,
        DISPLAY_NAME,
        PREFERRED_LANGUAGE,
        PREFERRED_TIME_ZONE,
      ),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.id.value).toBe(IDENTITY_ID);
    expect(saved.email.value).toBe(EMAIL);
    expect(saved.displayName.value).toBe(DISPLAY_NAME);
    expect(saved.preferredLanguage.code).toBe(PREFERRED_LANGUAGE);
    expect(saved.preferredTimeZone.name).toBe(PREFERRED_TIME_ZONE);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(saved.getUncommittedEvents()).toHaveLength(0);
  });

  it('rejects an invalid email — the invariant lives in the aggregate, not the caller', async () => {
    await expect(
      handler.execute(
        new RegisterIdentityCommand(
          IDENTITY_ID,
          'not-an-email',
          DISPLAY_NAME,
          PREFERRED_LANGUAGE,
          PREFERRED_TIME_ZONE,
        ),
      ),
    ).rejects.toThrow('Invalid email address format');

    expect(repository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
