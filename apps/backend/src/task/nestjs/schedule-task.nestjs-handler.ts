import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ScheduleTaskCommand } from '../application/commands/schedule-task.command';
import { ScheduleTaskCommandHandlerCore } from '../application/commands/schedule-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(ScheduleTaskCommand)
export class ScheduleTaskNestjsHandler implements ICommandHandler<ScheduleTaskCommand> {
  private readonly core: ScheduleTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new ScheduleTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: ScheduleTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
