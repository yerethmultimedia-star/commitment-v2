import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RelinkTaskCommitmentCommand } from '../application/commands/relink-task-commitment.command';
import { RelinkTaskCommitmentCommandHandlerCore } from '../application/commands/relink-task-commitment.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RelinkTaskCommitmentCommand)
export class RelinkTaskCommitmentNestjsHandler implements ICommandHandler<RelinkTaskCommitmentCommand> {
  private readonly core: RelinkTaskCommitmentCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RelinkTaskCommitmentCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: RelinkTaskCommitmentCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
