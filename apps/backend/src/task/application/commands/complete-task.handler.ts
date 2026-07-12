import { TaskId, TaskNotFoundError } from '@commitment/domain';
import { CompleteTaskCommand } from './complete-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class CompleteTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: CompleteTaskCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    task.complete(command.actualMinutes);

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
