import type { Task } from '@commitment/domain';
import type { TaskId, CommitmentId } from '@commitment/domain';

export interface TaskVersionedRepository {
  save(task: Task): Promise<number>;
  findById(id: TaskId): Promise<Task | null>;
  delete(id: TaskId): Promise<void>;
  /** Non-deleted Tasks linked to this Commitment, any status. Used by CommitmentActivationPreconditions (ADR-022 §3.1) and the Commitment->Task cancellation cascade (§6.1). */
  findByCommitmentId(commitmentId: CommitmentId): Promise<Task[]>;
}
