/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { Credential } from '@commitment/domain';
import type {
  CredentialRepository,
  SessionRepository,
} from '@commitment/domain';
import { LoginHandler } from './login.handler';
import { LoginCommand } from './login.command';
import type { CredentialHasherPort } from '../ports/credential-hasher.port';
import type { TokenServicePort } from '../ports/token-service.port';

const SESSION_ID = '01911f9e-2f3b-7c3e-9c3e-4a1b2c3d4e5f';
const CREDENTIAL_ID = '00000000-0000-0000-0000-000000000001';
const IDENTITY_ID = '00000000-0000-0000-0000-000000000010';
const LOGIN_IDENTIFIER = 'user@example.com';
const SECRET = 'correct horse battery staple';
const TOKEN = 'issued-token';

function activeCredential(): Credential {
  return Credential.register(
    CREDENTIAL_ID,
    IDENTITY_ID,
    LOGIN_IDENTIFIER,
    'some-hash',
  );
}

describe('LoginHandler', () => {
  let credentialRepository: jest.Mocked<CredentialRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let hasher: jest.Mocked<CredentialHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let eventBus: jest.Mocked<EventBus>;
  let handler: LoginHandler;

  beforeEach(() => {
    credentialRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByLoginIdentifier: jest.fn(),
    };
    sessionRepository = { save: jest.fn(), findById: jest.fn() };
    hasher = { hash: jest.fn(), verify: jest.fn() };
    tokenService = { issue: jest.fn(), verify: jest.fn() };
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new LoginHandler(
      credentialRepository,
      sessionRepository,
      hasher,
      tokenService,
      eventBus,
    );
  });

  it('throws Unauthorized when no credential exists for the login identifier', async () => {
    credentialRepository.findByLoginIdentifier.mockResolvedValue(null);

    await expect(
      handler.execute(new LoginCommand(SESSION_ID, LOGIN_IDENTIFIER, SECRET)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(hasher.verify).not.toHaveBeenCalled();
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('throws Unauthorized when the credential is blocked, without ever checking the secret', async () => {
    const credential = activeCredential();
    credential.block();
    credentialRepository.findByLoginIdentifier.mockResolvedValue(credential);

    await expect(
      handler.execute(new LoginCommand(SESSION_ID, LOGIN_IDENTIFIER, SECRET)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(hasher.verify).not.toHaveBeenCalled();
  });

  it('throws Unauthorized when the secret does not match, and the handler itself never compares hashes', async () => {
    const credential = activeCredential();
    credentialRepository.findByLoginIdentifier.mockResolvedValue(credential);
    hasher.verify.mockResolvedValue(false);

    await expect(
      handler.execute(new LoginCommand(SESSION_ID, LOGIN_IDENTIFIER, SECRET)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // The handler delegates the comparison entirely to the port — it passes the secret and the
    // stored hash through, it does not read/compare `credentialHash` itself anywhere else.
    expect(hasher.verify).toHaveBeenCalledWith(
      SECRET,
      credential.credentialHash,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('creates a Session and issues a token via TokenServicePort on success', async () => {
    const credential = activeCredential();
    credentialRepository.findByLoginIdentifier.mockResolvedValue(credential);
    hasher.verify.mockResolvedValue(true);
    tokenService.issue.mockResolvedValue(TOKEN);

    const token = await handler.execute(
      new LoginCommand(SESSION_ID, LOGIN_IDENTIFIER, SECRET),
    );

    expect(token).toBe(TOKEN);
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession.id).toBe(SESSION_ID);
    expect(savedSession.identityId).toBe(IDENTITY_ID);
    expect(savedSession.getUncommittedEvents()).toHaveLength(0);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(tokenService.issue).toHaveBeenCalledWith(
      SESSION_ID,
      IDENTITY_ID,
      expect.any(Date),
    );
  });
});
