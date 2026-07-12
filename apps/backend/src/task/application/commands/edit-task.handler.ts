import { TaskId, TaskTitle, TaskDescription } from '@commitment/domain';
import { EditTaskCommand } from './edit-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import { TaskNotFoundError } from '@commitment/domain';

export class EditTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: EditTaskCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    const title = command.title ? new TaskTitle(command.title) : undefined;
    const description =
      command.description !== undefined
        ? command.description
          ? new TaskDescription(command.description)
          : null
        : undefined;

    task.edit(
      title,
      description,
      command.estimatedMinutes,
      command.tags,
      command.metadata,
    );

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
