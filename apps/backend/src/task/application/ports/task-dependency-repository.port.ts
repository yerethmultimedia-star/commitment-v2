import type { TaskDependency, TaskId } from '@commitment/domain';

/**
 * ADR-022 §5 — minimal persistence for the TaskDependency graph. `findAll`
 * exists because TaskDependencyService.wouldCreateCycle() reasons about the
 * whole graph (reachability), not just one Task's edges.
 */
export interface TaskDependencyRepository {
  save(dependency: TaskDependency): Promise<void>;
  findAll(): Promise<TaskDependency[]>;
  /** Dependencies where this Task is the predecessor (its dependents). */
  findByPredecessorId(taskId: TaskId): Promise<TaskDependency[]>;
  /** Dependencies where this Task is the successor (its predecessors). */
  findBySuccessorId(taskId: TaskId): Promise<TaskDependency[]>;
}
