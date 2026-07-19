import type { CommitmentId } from '@commitment/domain';
import { StatusType } from '@commitment/domain';
import type { CommitmentActivationPreconditions as CommitmentActivationPreconditionsPort } from '../../../commitment/application/ports/commitment-activation-preconditions.port';
import type { TaskVersionedRepository } from '../ports/task-versioned-repository.port';

/**
 * Concrete implementation of Commitment's Activation Preconditions
 * (ADR-022 §3.1) — lives here, not in commitment/, because it needs
 * TaskRepository and CommitmentModule cannot import TaskModule without a
 * circular dependency (§3.2). Only evaluates the "Task" half of the
 * original "≥1 Task or Habit" requirement — Habit has no relationship to
 * Commitment yet (deferred to candidate "ADR-023", §12, not blocking).
 */
export class TaskBasedCommitmentActivationPreconditions implements CommitmentActivationPreconditionsPort {
  constructor(private readonly taskRepository: TaskVersionedRepository) {}

  public async hasExecutionPlan(commitmentId: CommitmentId): Promise<boolean> {
    const tasks = await this.taskRepository.findByCommitmentId(commitmentId);
    return tasks.some((task) => task.status.value !== StatusType.Cancelled);
  }
}
