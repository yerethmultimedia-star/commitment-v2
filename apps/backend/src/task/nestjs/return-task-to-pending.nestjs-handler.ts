import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReturnTaskToPendingCommand } from '../application/commands/return-task-to-pending.command';
import { ReturnTaskToPendingCommandHandlerCore } from '../application/commands/return-task-to-pending.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ReturnTaskToPendingCommand)
export class ReturnTaskToPendingNestjsHandler implements ICommandHandler<ReturnTaskToPendingCommand> {
  private readonly core: ReturnTaskToPendingCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new ReturnTaskToPendingCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: ReturnTaskToPendingCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
