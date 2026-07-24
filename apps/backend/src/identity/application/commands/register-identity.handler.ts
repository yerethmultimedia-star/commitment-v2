import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  Identity,
  IdentityId,
  Email,
  DisplayName,
  PreferredLanguage,
  PreferredTimeZone,
} from '@commitment/domain';
import type { IdentityRepository } from '@commitment/domain';
import { RegisterIdentityCommand } from './register-identity.command';

/**
 * AR-030 D-030.1 — the capability that materializes `Identity` as a real, persisted aggregate.
 * Not wired to any HTTP caller yet (no requirement for one exists — Fase 4A/4B scope is the
 * aggregate's backend enforcement boundary, not a public API), same posture Paso 2/AR-043 took
 * with `RegisterCredentialHandler`: the capability, not a commitment to any particular caller.
 */
@CommandHandler(RegisterIdentityCommand)
export class RegisterIdentityHandler implements ICommandHandler<RegisterIdentityCommand> {
  private readonly logger = new Logger(RegisterIdentityHandler.name);

  constructor(
    @Inject('IdentityRepository')
    private readonly identityRepository: IdentityRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(command: RegisterIdentityCommand): Promise<void> {
    this.logger.debug(`Registering identity ${command.identityId}`);

    const identity = Identity.register(
      new IdentityId(command.identityId),
      new Email(command.email),
      new DisplayName(command.displayName),
      new PreferredLanguage(command.preferredLanguage),
      new PreferredTimeZone(command.preferredTimeZone),
      new Date(),
    );
    await this.identityRepository.save(identity);

    const events = identity.getUncommittedEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
    identity.clearUncommittedEvents();
  }
}
