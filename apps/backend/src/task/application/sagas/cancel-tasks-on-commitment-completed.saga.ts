import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CommitmentCompletedEvent,
  CommitmentId,
  StatusType,
} from '@commitment/domain';
import { CancelTaskCommand } from '../commands/cancel-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';

/**
 * ADR-022 §6.1 — when a Commitment completes, every Task linked to it
 * (task.commitmentId === commitment.id) that isn't already in a terminal
 * state transitions to Cancelled. History is preserved — this cascades
 * Task.cancel() (a state transition, still queryable in each Task's event
 * history), never Task.delete() (a real soft-delete, semantically
 * different). Completed and already-Cancelled Tasks are left untouched
 * (idempotent, matches the ADR's transition table).
 */
@EventsHandler(CommitmentCompletedEvent)
export class CancelTasksOnCommitmentCompletedSaga implements IEventHandler<CommitmentCompletedEvent> {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskVersionedRepository,
    private readonly commandBus: CommandBus,
  ) {}

  public async handle(event: CommitmentCompletedEvent): Promise<void> {
    const commitmentId = new CommitmentId(event.payload.commitmentId);
    const tasks = await this.taskRepository.findByCommitmentId(commitmentId);

    for (const task of tasks) {
      const status = task.status.value;
      if (status === StatusType.Completed || status === StatusType.Cancelled)
        continue;
      await this.commandBus.execute(new CancelTaskCommand(task.id.value));
    }
  }
}
