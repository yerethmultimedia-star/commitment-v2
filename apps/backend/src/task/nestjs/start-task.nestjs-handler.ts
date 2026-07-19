import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { StartTaskCommand } from '../application/commands/start-task.command';
import { StartTaskCommandHandlerCore } from '../application/commands/start-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(StartTaskCommand)
export class StartTaskNestjsHandler implements ICommandHandler<StartTaskCommand> {
  private readonly core: StartTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new StartTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: StartTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
