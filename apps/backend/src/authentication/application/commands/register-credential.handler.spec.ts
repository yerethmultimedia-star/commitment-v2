/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { RegisterCredentialHandler } from './register-credential.handler';
import { RegisterCredentialCommand } from './register-credential.command';
import type { CredentialRepository } from '@commitment/domain';
import type { CredentialHasherPort } from '../ports/credential-hasher.port';

const CREDENTIAL_ID = '00000000-0000-0000-0000-000000000001';
const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';
const LOGIN_IDENTIFIER = 'user@example.com';
const SECRET = 'correct horse battery staple';
const HASH = 'hashed:correct horse battery staple';

describe('RegisterCredentialHandler', () => {
  let repository: jest.Mocked<CredentialRepository>;
  let hasher: jest.Mocked<CredentialHasherPort>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: RegisterCredentialHandler;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByLoginIdentifier: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new RegisterCredentialHandler(repository, hasher, eventBus);
  });

  it('hashes the secret via CredentialHasherPort and persists the credential — never compares/stores it raw', async () => {
    repository.findByLoginIdentifier.mockResolvedValue(null);
    hasher.hash.mockResolvedValue(HASH);

    await handler.execute(
      new RegisterCredentialCommand(
        CREDENTIAL_ID,
        IDENTITY_ID,
        LOGIN_IDENTIFIER,
        SECRET,
      ),
    );

    expect(hasher.hash).toHaveBeenCalledWith(SECRET);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.credentialHash).toBe(HASH);
    expect(saved.identityId).toBe(IDENTITY_ID);
    expect(saved.loginIdentifier).toBe(LOGIN_IDENTIFIER);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(saved.getUncommittedEvents()).toHaveLength(0);
  });

  it('throws if a credential already exists for the login identifier', async () => {
    const existing = { loginIdentifier: LOGIN_IDENTIFIER } as never;
    repository.findByLoginIdentifier.mockResolvedValue(existing);

    await expect(
      handler.execute(
        new RegisterCredentialCommand(
          CREDENTIAL_ID,
          IDENTITY_ID,
          LOGIN_IDENTIFIER,
          SECRET,
        ),
      ),
    ).rejects.toThrow('A credential already exists for this login identifier');

    expect(hasher.hash).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
