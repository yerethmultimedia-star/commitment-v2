import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CompleteTaskCommand } from '../application/commands/complete-task.command';
import { CompleteTaskCommandHandlerCore } from '../application/commands/complete-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(CompleteTaskCommand)
export class CompleteTaskNestjsHandler implements ICommandHandler<CompleteTaskCommand> {
  private readonly core: CompleteTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new CompleteTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: CompleteTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
