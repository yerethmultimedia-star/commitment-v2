import { QueryHandler, EventBus, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SessionStatusType } from '@commitment/domain';
import type { SessionRepository } from '@commitment/domain';
import { ValidateSessionQuery } from './validate-session.query';
import type { TokenServicePort } from '../ports/token-service.port';

export interface ValidatedIdentity {
  readonly identityId: string;
  readonly sessionId: string;
}

/** AR-043 Paso 1/H-043.6 — must check live `SessionStatus`/`expiresAt` on every call; the token's
 * own claims are never authoritative for revocation. Also where sliding expiration (Paso 6A —
 * no Refresh Token) is applied: a successful validation extends the same Session's `expiresAt`.
 * Not a pure read — deliberately, this is the use case's whole point, not an accidental side
 * effect. */
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — kept in sync with LoginHandler

@QueryHandler(ValidateSessionQuery)
export class ValidateSessionHandler implements IQueryHandler<ValidateSessionQuery> {
  private readonly logger = new Logger(ValidateSessionHandler.name);

  constructor(
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    @Inject('TokenServicePort')
    private readonly tokenService: TokenServicePort,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(
    query: ValidateSessionQuery,
  ): Promise<ValidatedIdentity | null> {
    const verified = await this.tokenService.verify(query.token);
    if (!verified) {
      return null;
    }

    const session = await this.sessionRepository.findById(verified.sessionId);
    if (!session) {
      return null;
    }

    const now = new Date();

    if (!session.isValidAt(now)) {
      if (session.status.value === SessionStatusType.Active) {
        // Active in stored status, but past `expiresAt`: the invariant is enforced here, not by
        // a background sweep (Paso 1/Session aggregate comment).
        session.markExpired(now);
        await this.sessionRepository.save(session);
        const events = session.getUncommittedEvents();
        for (const event of events) {
          this.eventBus.publish(event);
        }
        session.clearUncommittedEvents();
      }
      this.logger.debug(`Session ${verified.sessionId} is not valid`);
      return null;
    }

    session.extend(new Date(now.getTime() + SESSION_DURATION_MS), now);
    await this.sessionRepository.save(session);

    return { identityId: session.identityId, sessionId: session.id };
  }
}
