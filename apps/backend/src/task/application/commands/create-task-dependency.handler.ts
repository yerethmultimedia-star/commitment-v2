import {
  TaskId,
  TaskDependency,
  TaskDependencyService,
  TaskNotFoundError,
  TaskDependencyCycleError,
  StatusType,
} from '@commitment/domain';
import { randomUUID } from 'crypto';
import { CreateTaskDependencyCommand } from './create-task-dependency.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { TaskDependencyRepository } from '../ports/task-dependency-repository.port';
import type { DomainEventDispatcher } from '../../../commitment/application/ports/domain-event-dispatcher.port';

export class CreateTaskDependencyCommandHandlerCore {
  constructor(
    private readonly taskRepository: TaskVersionedRepository,
    private readonly dependencyRepository: TaskDependencyRepository,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  public async handle(command: CreateTaskDependencyCommand): Promise<void> {
    const predecessorId = new TaskId(command.predecessorTaskId);
    const successorId = new TaskId(command.successorTaskId);

    const [predecessor, successor] = await Promise.all([
      this.taskRepository.findById(predecessorId),
      this.taskRepository.findById(successorId),
    ]);
    if (!predecessor) {
      throw new TaskNotFoundError(
        `Task not found: ${command.predecessorTaskId}`,
      );
    }
    if (!successor) {
      throw new TaskNotFoundError(`Task not found: ${command.successorTaskId}`);
    }

    // ADR-022 §5 — anti-cycle invariant, checked against the whole graph
    // (pure domain service, no I/O of its own).
    const existing = await this.dependencyRepository.findAll();
    if (
      TaskDependencyService.wouldCreateCycle(
        existing,
        predecessorId,
        successorId,
      )
    ) {
      throw new TaskDependencyCycleError(
        `Creating this dependency would form a cycle between ${command.predecessorTaskId} and ${command.successorTaskId}.`,
      );
    }

    const dependency = TaskDependency.create(
      randomUUID(),
      predecessorId,
      successorId,
    );
    await this.dependencyRepository.save(dependency);

    // ADR-022 §4.2/§5 — the block is automatic and never a manual action.
    // Only triggered when the successor is still in an operative state that
    // block() itself accepts (Pending/InProgress); a successor that's
    // already Blocked, Completed, or Cancelled is left as-is.
    const successorStatus = successor.status.value;
    const predecessorIncomplete =
      predecessor.status.value !== StatusType.Completed;
    const successorBlockable =
      successorStatus === StatusType.Pending ||
      successorStatus === StatusType.InProgress;

    if (predecessorIncomplete && successorBlockable) {
      successor.block('dependency');
      await this.taskRepository.save(successor);
      await this.eventDispatcher.dispatch(successor.getUncommittedEvents());
      successor.clearUncommittedEvents();
    }
  }
}
