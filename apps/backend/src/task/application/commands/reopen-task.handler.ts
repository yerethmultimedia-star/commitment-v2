import { TaskId, TaskNotFoundError } from '@commitment/domain';
import { ReopenTaskCommand } from './reopen-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';
import type { TaskReopenPreconditions } from '../preconditions/task-reopen.preconditions';

export class ReopenTaskCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
    private readonly reopenPreconditions: TaskReopenPreconditions,
  ) {}

  public async handle(command: ReopenTaskCommand): Promise<void> {
    const id = new TaskId(command.id);
    const task = await this.taskRepository.findById(id);
    if (!task) throw new TaskNotFoundError(`Task not found: ${command.id}`);

    // Command Preconditions (ADR-022 §6.2) — the aggregate still decides
    // and throws (Rule #86), it just can't resolve this cross-aggregate
    // fact about its Commitment by itself.
    const commitmentAllowsReopen =
      await this.reopenPreconditions.commitmentAllowsReopen(task);

    task.reopen(commitmentAllowsReopen);

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatch(task.getUncommittedEvents());
    task.clearUncommittedEvents();
  }
}
