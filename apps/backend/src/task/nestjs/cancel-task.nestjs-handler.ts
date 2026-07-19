import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelTaskCommand } from '../application/commands/cancel-task.command';
import { CancelTaskCommandHandlerCore } from '../application/commands/cancel-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(CancelTaskCommand)
export class CancelTaskNestjsHandler implements ICommandHandler<CancelTaskCommand> {
  private readonly core: CancelTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new CancelTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: CancelTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
