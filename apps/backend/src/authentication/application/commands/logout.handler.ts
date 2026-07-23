import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import type { SessionRepository } from '@commitment/domain';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(command: LogoutCommand): Promise<void> {
    this.logger.debug(`Logout for session ${command.sessionId}`);

    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      // Idempotent: logging out a session that doesn't exist (or already gone) is a no-op,
      // not an error — the caller's goal (this session is not usable) is already satisfied.
      return;
    }

    session.revoke();
    await this.sessionRepository.save(session);

    const events = session.getUncommittedEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
    session.clearUncommittedEvents();
  }
}
