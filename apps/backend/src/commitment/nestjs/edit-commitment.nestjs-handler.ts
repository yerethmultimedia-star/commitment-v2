import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EditCommitmentCommand } from '../application/commands/edit-commitment.command';
import { EditCommitmentCommandHandlerCore } from '../application/commands/edit-commitment.handler';
import type { VersionedCommitmentRepository } from '../application/ports/versioned-commitment-repository.port';
import type { DomainEventDispatcher } from '../application/ports/domain-event-dispatcher.port';

@CommandHandler(EditCommitmentCommand)
export class EditCommitmentNestjsHandler implements ICommandHandler<EditCommitmentCommand> {
  private readonly core: EditCommitmentCommandHandlerCore;

  constructor(
    @Inject('CommitmentRepository')
    private readonly commitmentRepository: VersionedCommitmentRepository,
    @Inject('DomainEventDispatcher')
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new EditCommitmentCommandHandlerCore(
      this.commitmentRepository,
      this.eventDispatcher,
    );
  }

  async execute(command: EditCommitmentCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
