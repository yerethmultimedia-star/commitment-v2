import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterTaskCommand } from '../application/commands/register-task.command';
import { RegisterTaskCommandHandlerCore } from '../application/commands/register-task.handler';
import type { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../commitment/application/ports/domain-event-dispatcher.port';

@CommandHandler(RegisterTaskCommand)
export class RegisterTaskNestjsHandler implements ICommandHandler<RegisterTaskCommand> {
  private readonly core: RegisterTaskCommandHandlerCore;

  constructor(
    @Inject('TaskRepository')
    taskRepository: TaskVersionedRepository,
    @Inject('DomainEventDispatcher')
    eventDispatcher: DomainEventDispatcher,
  ) {
    this.core = new RegisterTaskCommandHandlerCore(
      taskRepository,
      eventDispatcher,
    );
  }

  async execute(command: RegisterTaskCommand): Promise<unknown> {
    return this.core.handle(command);
  }
}
