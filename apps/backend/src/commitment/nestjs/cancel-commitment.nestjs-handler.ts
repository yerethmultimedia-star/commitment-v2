import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelCommitmentCommand } from '../application/commands/cancel-commitment.command';
import { CancelCommitmentResult } from '../application/commands/cancel-commitment.result';
import { CancelCommitmentCommandHandlerCore } from '../application/commands/cancel-commitment.handler';
import { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(CancelCommitmentCommand)
export class CancelCommitmentNestjsHandler implements ICommandHandler<
  CancelCommitmentCommand,
  CancelCommitmentResult
> {
  private readonly core: CancelCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new CancelCommitmentCommandHandlerCore(repository, dispatcher);
  }

  public async execute(
    command: CancelCommitmentCommand,
  ): Promise<CancelCommitmentResult> {
    return this.core.handle(command);
  }
}
