import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UnblockTaskCommand } from '../application/commands/unblock-task.command';
import { UnblockTaskCommandHandlerCore } from '../application/commands/unblock-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(UnblockTaskCommand)
export class UnblockTaskNestjsHandler implements ICommandHandler<UnblockTaskCommand> {
  private readonly core: UnblockTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new UnblockTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: UnblockTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
