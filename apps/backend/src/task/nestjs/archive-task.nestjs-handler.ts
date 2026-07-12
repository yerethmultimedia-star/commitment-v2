import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ArchiveTaskCommand } from '../application/commands/archive-task.command';
import { ArchiveTaskCommandHandlerCore } from '../application/commands/archive-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ArchiveTaskCommand)
export class ArchiveTaskNestjsHandler implements ICommandHandler<ArchiveTaskCommand> {
  private readonly core: ArchiveTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new ArchiveTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: ArchiveTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
