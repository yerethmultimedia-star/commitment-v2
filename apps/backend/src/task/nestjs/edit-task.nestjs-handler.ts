import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EditTaskCommand } from '../application/commands/edit-task.command';
import { EditTaskCommandHandlerCore } from '../application/commands/edit-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(EditTaskCommand)
export class EditTaskNestjsHandler implements ICommandHandler<EditTaskCommand> {
  private readonly core: EditTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new EditTaskCommandHandlerCore(taskRepository, eventDispatcher);
  }

  async execute(command: EditTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
