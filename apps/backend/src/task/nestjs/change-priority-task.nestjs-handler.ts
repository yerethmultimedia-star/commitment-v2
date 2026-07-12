import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangePriorityTaskCommand } from '../application/commands/change-priority-task.command';
import { ChangePriorityTaskCommandHandlerCore } from '../application/commands/change-priority-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ChangePriorityTaskCommand)
export class ChangePriorityTaskNestjsHandler implements ICommandHandler<ChangePriorityTaskCommand> {
  private readonly core: ChangePriorityTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new ChangePriorityTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: ChangePriorityTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
