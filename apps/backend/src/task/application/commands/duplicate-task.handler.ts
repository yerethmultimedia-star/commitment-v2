import { TaskId, TaskNotFoundError } from '@commitment/domain';
import { DuplicateTaskCommand } from './duplicate-task.command';
import { RegisterTaskResult } from './register-task.result';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class DuplicateTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(
    command: DuplicateTaskCommand,
  ): Promise<RegisterTaskResult> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    const newId = new TaskId(command.newId);
    const copy = task.duplicate(newId);

    // Save original (emits TaskDuplicatedEvent), save copy
    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();

    const version = await this.taskRepository.save(copy);
    await this.eventDispatcher.dispatch(copy.getUncommittedEvents());
    copy.clearUncommittedEvents();

    return new RegisterTaskResult(copy.id.value, version);
  }
}
