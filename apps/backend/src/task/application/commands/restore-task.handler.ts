import { TaskId, TaskNotFoundError } from '@commitment/domain';
import { RestoreTaskCommand } from './restore-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class RestoreTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: RestoreTaskCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    task.restore();

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
