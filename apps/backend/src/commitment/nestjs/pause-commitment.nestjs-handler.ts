import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PauseCommitmentCommand } from '../application/commands/pause-commitment.command';
import { PauseCommitmentCommandHandlerCore } from '../application/commands/pause-commitment.handler';
import { PauseCommitmentResult } from '../application/commands/pause-commitment.result';
import type { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(PauseCommitmentCommand)
export class PauseCommitmentNestjsHandler implements ICommandHandler<
  PauseCommitmentCommand,
  PauseCommitmentResult
> {
  private readonly core: PauseCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new PauseCommitmentCommandHandlerCore(repository, dispatcher);
  }

  public async execute(
    command: PauseCommitmentCommand,
  ): Promise<PauseCommitmentResult> {
    return this.core.handle(command);
  }
}
