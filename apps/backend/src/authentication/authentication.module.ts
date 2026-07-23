import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { RegisterCredentialHandler } from './application/commands/register-credential.handler';
import { LoginHandler } from './application/commands/login.handler';
import { LogoutHandler } from './application/commands/logout.handler';
import { ValidateSessionHandler } from './application/queries/validate-session.handler';
import { InMemoryCredentialRepository } from './infrastructure/in-memory-credential.repository';
import { InMemorySessionRepository } from './infrastructure/in-memory-session.repository';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { Argon2CredentialHasher } from './infrastructure/argon2-credential-hasher';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthenticationController } from './api/authentication.controller';

/**
 * AR-043 D-043.1 — Authentication bounded context, independent of `Identity` (AR-030).
 * Fase 4B.4: `JwtTokenService`/`Argon2CredentialHasher` replace the Fase 4B.1 stubs — the DI
 * tokens ('TokenServicePort'/'CredentialHasherPort') are unchanged, so nothing outside this
 * module's provider list needed to change (Paso 6C/6D were always implementation, not contract).
 */
@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      // AR-043 Paso 6A: no Refresh Token; the JWT's own `expiresIn` is set per-call in
      // `JwtTokenService.issue()` from `Session.expiresAt`, this is just the signing secret.
      secret:
        process.env.AUTH_JWT_SECRET ||
        'dev-only-insecure-secret-do-not-use-in-production',
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    RegisterCredentialHandler,
    LoginHandler,
    LogoutHandler,
    ValidateSessionHandler,
    SessionAuthGuard,
    {
      provide: 'CredentialRepository',
      useClass: InMemoryCredentialRepository,
    },
    {
      provide: 'SessionRepository',
      useClass: InMemorySessionRepository,
    },
    {
      provide: 'TokenServicePort',
      useClass: JwtTokenService,
    },
    {
      provide: 'CredentialHasherPort',
      useClass: Argon2CredentialHasher,
    },
  ],
})
export class AuthenticationModule {}
