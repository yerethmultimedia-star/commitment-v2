import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DuplicateTaskCommand } from '../application/commands/duplicate-task.command';
import { DuplicateTaskCommandHandlerCore } from '../application/commands/duplicate-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(DuplicateTaskCommand)
export class DuplicateTaskNestjsHandler implements ICommandHandler<DuplicateTaskCommand> {
  private readonly core: DuplicateTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new DuplicateTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: DuplicateTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
