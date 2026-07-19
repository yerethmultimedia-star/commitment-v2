import type { CommitmentId } from '@commitment/domain';
import { StatusType } from '@commitment/domain';
import type { CommitmentActivationPreconditions as CommitmentActivationPreconditionsPort } from '../../../commitment/application/ports/commitment-activation-preconditions.port';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';

/**
 * Concrete implementation of Commitment's Activation Preconditions
 * (ADR-022 §3.1) — lives here, not in commitment/, because it needs
 * TaskRepository and CommitmentModule cannot import TaskModule without a
 * circular dependency (§3.2). Evaluates Task only, by design, not by
 * omission — ADR-023 (`docs/03-architecture/
 * adr_023_habit_commitment_relationship.md`) formally decided Habit is not
 * part of this invariant: the class name keeps "TaskBased" as an accurate
 * description, not a placeholder for a "HabitBased" counterpart that was
 * never going to be built.
 */
export class TaskBasedCommitmentActivationPreconditions implements CommitmentActivationPreconditionsPort {
  constructor(private readonly taskRepository: TaskVersionedRepository) {}

  public async hasExecutionPlan(commitmentId: CommitmentId): Promise<boolean> {
    const tasks = await this.taskRepository.findByCommitmentId(commitmentId);
    return tasks.some((task) => task.status.value !== StatusType.Cancelled);
  }
}
