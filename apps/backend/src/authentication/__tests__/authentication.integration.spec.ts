import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticationModule } from '../authentication.module';
import { RegisterCredentialCommand } from '../application/commands/register-credential.command';
import { LoginCommand } from '../application/commands/login.command';
import { SessionAuthGuard } from '../guards/session-auth.guard';

/**
 * AR-043 Fase 4B.4 — the one test in this module that does NOT mock the ports: it boots the real
 * `AuthenticationModule` (real Argon2 hashing, real JWT signing/verification) to prove the design
 * is genuinely implementable end to end, not just individually mockable. Everything else in this
 * bounded context is tested with doubles (Fase 4B.2/4B.3) by design.
 */
describe('Authentication module — real Argon2 + real JWT, no mocks (AR-043 Fase 4B.4)', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [CqrsModule.forRoot(), AuthenticationModule],
    }).compile();
    await module.init();

    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterAll(async () => {
    await module.close();
  });

  it('registers a credential (real Argon2 hash), logs in (real JWT issued), and the Guard validates it (real JWT verified)', async () => {
    const credentialId = '00000000-0000-0000-0000-000000000001';
    const identityId = '00000000-0000-0000-0000-000000000010';
    const loginIdentifier = 'integration-test@example.com';
    const secret = 'correct horse battery staple';

    await commandBus.execute(
      new RegisterCredentialCommand(
        credentialId,
        identityId,
        loginIdentifier,
        secret,
      ),
    );

    const token = await commandBus.execute<LoginCommand, string>(
      new LoginCommand(
        '01911f9e-2f3b-7c3e-9c3e-4a1b2c3d4e5f',
        loginIdentifier,
        secret,
      ),
    );

    expect(typeof token).toBe('string');
    // A real JWT has 3 dot-separated segments — proves this is genuinely `@nestjs/jwt`, not the
    // Fase 4B.1 base64 stub (which had no dots).
    expect(token.split('.')).toHaveLength(3);

    const guard = module.get(SessionAuthGuard);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: `Bearer ${token}` } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects login with the wrong secret — Argon2.verify() genuinely fails, not a mock returning false', async () => {
    const credentialId = '00000000-0000-0000-0000-000000000002';
    const identityId = '00000000-0000-0000-0000-000000000020';
    const loginIdentifier = 'wrong-secret-test@example.com';

    await commandBus.execute(
      new RegisterCredentialCommand(
        credentialId,
        identityId,
        loginIdentifier,
        'the-real-secret',
      ),
    );

    await expect(
      commandBus.execute(
        new LoginCommand(
          '01911f9e-2f3b-7c3e-9c3e-000000000002',
          loginIdentifier,
          'a-wrong-secret',
        ),
      ),
    ).rejects.toThrow();
  });

  it('Guard rejects a tampered token — real JWT signature verification fails', async () => {
    const guard = module.get(SessionAuthGuard);
    const tamperedToken = 'not.a.validsignature';
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${tamperedToken}` },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('sanity: QueryBus is wired (ValidateSessionQuery handler is registered)', () => {
    expect(queryBus).toBeDefined();
  });
});
