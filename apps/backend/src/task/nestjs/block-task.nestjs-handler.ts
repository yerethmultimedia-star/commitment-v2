import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlockTaskCommand } from '../application/commands/block-task.command';
import { BlockTaskCommandHandlerCore } from '../application/commands/block-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(BlockTaskCommand)
export class BlockTaskNestjsHandler implements ICommandHandler<BlockTaskCommand> {
  private readonly core: BlockTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new BlockTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: BlockTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
