import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CompleteCommitmentCommand } from '../application/commands/complete-commitment.command';
import { CompleteCommitmentResult } from '../application/commands/complete-commitment.result';
import { CompleteCommitmentCommandHandlerCore } from '../application/commands/complete-commitment.handler';
import { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(CompleteCommitmentCommand)
export class CompleteCommitmentNestjsHandler implements ICommandHandler<
  CompleteCommitmentCommand,
  CompleteCommitmentResult
> {
  private readonly core: CompleteCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new CompleteCommitmentCommandHandlerCore(
      repository,
      dispatcher,
    );
  }

  public async execute(
    command: CompleteCommitmentCommand,
  ): Promise<CompleteCommitmentResult> {
    return this.core.handle(command);
  }
}
