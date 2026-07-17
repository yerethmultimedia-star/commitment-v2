import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RelinkTaskGoalCommand } from '../application/commands/relink-task-goal.command';
import { RelinkTaskGoalCommandHandlerCore } from '../application/commands/relink-task-goal.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RelinkTaskGoalCommand)
export class RelinkTaskGoalNestjsHandler implements ICommandHandler<RelinkTaskGoalCommand> {
  private readonly core: RelinkTaskGoalCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RelinkTaskGoalCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: RelinkTaskGoalCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
