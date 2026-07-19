import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReopenTaskCommand } from '../application/commands/reopen-task.command';
import { ReopenTaskCommandHandlerCore } from '../application/commands/reopen-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';
import type { TaskReopenPreconditions } from '../application/preconditions/task-reopen.preconditions';

@CommandHandler(ReopenTaskCommand)
export class ReopenTaskNestjsHandler implements ICommandHandler<ReopenTaskCommand> {
  private readonly core: ReopenTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
    @Inject('TaskReopenPreconditions')
    reopenPreconditions: TaskReopenPreconditions,
  ) {
    this.core = new ReopenTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
      reopenPreconditions,
    );
  }

  async execute(command: ReopenTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
