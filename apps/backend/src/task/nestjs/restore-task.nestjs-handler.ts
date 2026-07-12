import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RestoreTaskCommand } from '../application/commands/restore-task.command';
import { RestoreTaskCommandHandlerCore } from '../application/commands/restore-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RestoreTaskCommand)
export class RestoreTaskNestjsHandler implements ICommandHandler<RestoreTaskCommand> {
  private readonly core: RestoreTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RestoreTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: RestoreTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
