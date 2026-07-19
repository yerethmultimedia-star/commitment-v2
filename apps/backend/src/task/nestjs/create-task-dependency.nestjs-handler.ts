import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTaskDependencyCommand } from '../application/commands/create-task-dependency.command';
import { CreateTaskDependencyCommandHandlerCore } from '../application/commands/create-task-dependency.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { TaskDependencyRepository } from '../application/ports/task-dependency-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(CreateTaskDependencyCommand)
export class CreateTaskDependencyNestjsHandler implements ICommandHandler<CreateTaskDependencyCommand> {
  private readonly core: CreateTaskDependencyCommandHandlerCore;

  constructor(
    @Inject('TaskRepository') taskRepository: TaskVersionedRepository,
    @Inject('TaskDependencyRepository')
    dependencyRepository: TaskDependencyRepository,
    @Inject('DomainEventDispatcher') eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new CreateTaskDependencyCommandHandlerCore(
      taskRepository,
      dependencyRepository,
      eventDispatcher,
    );
  }

  async execute(command: CreateTaskDependencyCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
