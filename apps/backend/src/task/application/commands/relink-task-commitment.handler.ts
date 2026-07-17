import { TaskId, CommitmentId, TaskNotFoundError } from '@commitment/domain';
import { RelinkTaskCommitmentCommand } from './relink-task-commitment.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class RelinkTaskCommitmentCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: RelinkTaskCommitmentCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    const commitmentId = command.commitmentId
      ? new CommitmentId(command.commitmentId)
      : null;
    task.relinkCommitment(commitmentId, new Date());

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
