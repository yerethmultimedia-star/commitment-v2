import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Credential } from '@commitment/domain';
import type { CredentialRepository } from '@commitment/domain';
import { RegisterCredentialCommand } from './register-credential.command';
import type { CredentialHasherPort } from '../ports/credential-hasher.port';

/**
 * AR-043 Paso 2 — "Register (Provision) Credential": a capability the application needs so that
 * Login has something to verify against. Deliberately not exposed as a public self-service
 * sign-up flow (no requirement for one exists yet, Paso 2/Fase 4A) — this handler is the
 * capability, not a commitment to any particular caller (admin command, seed, future signup UI).
 */
@CommandHandler(RegisterCredentialCommand)
export class RegisterCredentialHandler implements ICommandHandler<RegisterCredentialCommand> {
  private readonly logger = new Logger(RegisterCredentialHandler.name);

  constructor(
    @Inject('CredentialRepository')
    private readonly credentialRepository: CredentialRepository,
    @Inject('CredentialHasherPort')
    private readonly hasher: CredentialHasherPort,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(command: RegisterCredentialCommand): Promise<void> {
    this.logger.debug(
      `Registering credential ${command.credentialId} for identity ${command.identityId}`,
    );

    const existing = await this.credentialRepository.findByLoginIdentifier(
      command.loginIdentifier,
    );
    if (existing) {
      throw new Error('A credential already exists for this login identifier');
    }

    const credentialHash = await this.hasher.hash(command.secret);
    const credential = Credential.register(
      command.credentialId,
      command.identityId,
      command.loginIdentifier,
      credentialHash,
    );
    await this.credentialRepository.save(credential);

    const events = credential.getUncommittedEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
    credential.clearUncommittedEvents();
  }
}
