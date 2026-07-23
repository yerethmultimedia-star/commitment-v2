import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { Session } from '@commitment/domain';
import type {
  CredentialRepository,
  SessionRepository,
} from '@commitment/domain';
import { LoginCommand } from './login.command';
import type { CredentialHasherPort } from '../ports/credential-hasher.port';
import type { TokenServicePort } from '../ports/token-service.port';

/** AR-043 Paso 6A — no Refresh Token: a single long-lived, revocable, sliding-expiration Session. */
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    @Inject('CredentialRepository')
    private readonly credentialRepository: CredentialRepository,
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    @Inject('CredentialHasherPort')
    private readonly hasher: CredentialHasherPort,
    @Inject('TokenServicePort')
    private readonly tokenService: TokenServicePort,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(command: LoginCommand): Promise<string> {
    this.logger.debug(`Login attempt for ${command.loginIdentifier}`);

    const credential = await this.credentialRepository.findByLoginIdentifier(
      command.loginIdentifier,
    );
    if (!credential || !credential.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const secretMatches = await this.hasher.verify(
      command.secret,
      credential.credentialHash,
    );
    if (!secretMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
    const session = Session.create(
      command.sessionId,
      credential.identityId,
      expiresAt,
      now,
    );
    await this.sessionRepository.save(session);

    const events = session.getUncommittedEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
    session.clearUncommittedEvents();

    return this.tokenService.issue(
      session.id,
      credential.identityId,
      expiresAt,
    );
  }
}
