import {
  TaskId,
  TaskPriority,
  PriorityType,
  TaskNotFoundError,
} from '@commitment/domain';
import { ChangePriorityTaskCommand } from './change-priority-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class ChangePriorityTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: ChangePriorityTaskCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    const priority = new TaskPriority(command.priority as PriorityType);
    task.changePriority(priority);

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
