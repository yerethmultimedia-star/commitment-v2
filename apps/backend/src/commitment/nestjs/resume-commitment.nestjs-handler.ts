import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ResumeCommitmentCommand } from '../application/commands/resume-commitment.command';
import { ResumeCommitmentCommandHandlerCore } from '../application/commands/resume-commitment.handler';
import type { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(ResumeCommitmentCommand)
export class ResumeCommitmentNestjsHandler implements ICommandHandler<ResumeCommitmentCommand> {
  private readonly core: ResumeCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    repository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    dispatcher: DomainEventDispatcher,
  ) {
    this.core = new ResumeCommitmentCommandHandlerCore(repository, dispatcher);
  }

  public execute(command: ResumeCommitmentCommand) {
    return this.core.handle(command);
  }
}
