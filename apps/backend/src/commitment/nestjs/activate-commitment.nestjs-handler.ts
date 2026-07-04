import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActivateCommitmentCommand } from '../application/commands/activate-commitment.command';
import { ActivateCommitmentCommandHandlerCore } from '../application/commands/activate-commitment.handler';
import type { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(ActivateCommitmentCommand)
export class ActivateCommitmentNestjsHandler implements ICommandHandler<ActivateCommitmentCommand> {
  private readonly core: ActivateCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new ActivateCommitmentCommandHandlerCore(
      repository,
      dispatcher,
    );
  }

  public execute(command: ActivateCommitmentCommand) {
    return this.core.handle(command);
  }
}
