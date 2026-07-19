import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActivateCommitmentCommand } from '../../commitment/application/commands/activate-commitment.command';
import { ActivateCommitmentCommandHandlerCore } from '../../commitment/application/commands/activate-commitment.handler';
import type { VersionedCommitmentRepository } from '../../commitment/application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { CommitmentActivationPreconditions } from '../../commitment/application/ports/commitment-activation-preconditions.port';

/**
 * Registered in TaskModule, not CommitmentModule, even though this handles
 * a Commitment command — ADR-022 §3.2. TaskModule already imports
 * CommitmentModule (the correct direction); the reverse would be a
 * circular module dependency. The Command/Result/Core stay in
 * commitment/application/commands/ unchanged — only this NestJS wiring
 * file relocates, same cross-module reuse already validated for the
 * shared DomainEventDispatcher.
 */
@CommandHandler(ActivateCommitmentCommand)
export class ActivateCommitmentNestjsHandler implements ICommandHandler<ActivateCommitmentCommand> {
  private readonly core: ActivateCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
    @Inject('CommitmentActivationPreconditions')
    activationPreconditions: CommitmentActivationPreconditions,
  ) {
    this.core = new ActivateCommitmentCommandHandlerCore(
      repository,
      dispatcher,
      activationPreconditions,
    );
  }

  public execute(command: ActivateCommitmentCommand) {
    return this.core.handle(command);
  }
}
