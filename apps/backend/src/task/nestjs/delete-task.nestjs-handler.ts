import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteTaskCommand } from '../application/commands/delete-task.command';
import { DeleteTaskCommandHandlerCore } from '../application/commands/delete-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskNestjsHandler implements ICommandHandler<DeleteTaskCommand> {
  private readonly core: DeleteTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new DeleteTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: DeleteTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
