import { Entity } from '../../shared/entity.js';
import { TaskId } from '../value-objects/task-id.js';
import { InvalidTaskDependencyError } from '../errors/task-errors.js';

/**
 * A first-class relationship entity (ADR-022 §5), not a raw ID array on
 * Task — deliberately, so future extension (dependency type, strength,
 * required percentage) doesn't require a breaking migration later. None of
 * those future fields exist yet; this is exactly the 4-field V1 shape the
 * ADR specifies, nothing more.
 *
 * `predecessorTaskId` must complete before `successorTaskId` is considered
 * unblocked (see TaskDependencyService for the cycle check, and Task.block()
 * / Task.unblock() for how a Task actually reacts to its dependency state).
 */
export interface TaskDependencyProps {
  predecessorTaskId: TaskId;
  successorTaskId: TaskId;
  createdAt: Date;
}

export class TaskDependency extends Entity<string> {
  private readonly _props: TaskDependencyProps;

  private constructor(id: string, props: TaskDependencyProps) {
    super(id);
    this._props = props;
  }

  public static create(
    id: string,
    predecessorTaskId: TaskId,
    successorTaskId: TaskId,
    createdAt: Date = new Date()
  ): TaskDependency {
    if (predecessorTaskId.value === successorTaskId.value) {
      throw new InvalidTaskDependencyError('A task cannot depend on itself.');
    }
    return new TaskDependency(id, { predecessorTaskId, successorTaskId, createdAt });
  }

  public get predecessorTaskId(): TaskId {
    return this._props.predecessorTaskId;
  }

  public get successorTaskId(): TaskId {
    return this._props.successorTaskId;
  }

  public get createdAt(): Date {
    return this._props.createdAt;
  }
}
