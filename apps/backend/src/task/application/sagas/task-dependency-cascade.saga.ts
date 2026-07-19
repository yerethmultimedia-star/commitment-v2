import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TaskCompletedEvent, TaskId, StatusType } from '@commitment/domain';
import { UnblockTaskCommand } from '../commands/unblock-task.command';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';
import type { TaskDependencyRepository } from '../ports/task-dependency-repository.port';

/**
 * ADR-022 §4.2/§5 — a dependency-blocked Task can only be unblocked
 * automatically, when its predecessor completes. This is the automatic
 * side: when a Task completes, every Task that depends on it (as
 * successor) is checked, and unblocked only once ALL of its predecessors
 * are Completed (a successor can have more than one predecessor).
 */
@EventsHandler(TaskCompletedEvent)
export class TaskDependencyCascadeSaga implements IEventHandler<TaskCompletedEvent> {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskVersionedRepository,
    @Inject('TaskDependencyRepository')
    private readonly dependencyRepository: TaskDependencyRepository,
    private readonly commandBus: CommandBus,
  ) {}

  public async handle(event: TaskCompletedEvent): Promise<void> {
    const completedTaskId = new TaskId(event.payload.taskId);
    const dependents =
      await this.dependencyRepository.findByPredecessorId(completedTaskId);

    for (const dependency of dependents) {
      const successor = await this.taskRepository.findById(
        dependency.successorTaskId,
      );
      if (!successor || successor.status.value !== StatusType.Blocked) continue;

      const predecessorDeps = await this.dependencyRepository.findBySuccessorId(
        dependency.successorTaskId,
      );
      const predecessorTasks = await Promise.all(
        predecessorDeps.map((dep) =>
          this.taskRepository.findById(dep.predecessorTaskId),
        ),
      );
      const allPredecessorsCompleted = predecessorTasks.every(
        (task) => task?.status.value === StatusType.Completed,
      );

      if (allPredecessorsCompleted) {
        await this.commandBus.execute(
          new UnblockTaskCommand(dependency.successorTaskId.value, 'system'),
        );
      }
    }
  }
}
