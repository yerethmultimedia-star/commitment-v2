import { CommitmentState } from '@commitment/domain';
import type { Task } from '@commitment/domain';
import type { VersionedCommitmentRepository } from '../../../commitment/application/ports/versioned-commitment-repository.port';

/**
 * Command Preconditions (ADR-022 §6.2) — resolves whether a Task's linked
 * Commitment still allows it to Reopen. Unlike
 * TaskBasedCommitmentActivationPreconditions, this needs no special module
 * placement: TaskModule already imports CommitmentModule in the correct
 * direction, so this can use CommitmentRepository directly without any
 * circular-dependency workaround.
 */
export class TaskReopenPreconditions {
  constructor(
    private readonly commitmentRepository: VersionedCommitmentRepository,
  ) {}

  public async commitmentAllowsReopen(task: Task): Promise<boolean> {
    if (!task.commitmentId) {
      return true; // No linked Commitment — always allowed.
    }
    const commitment = await this.commitmentRepository.findById(
      task.commitmentId,
    );
    if (!commitment) {
      // Linked Commitment no longer exists — treat as not allowing reopen
      // rather than silently ignoring a dangling reference.
      return false;
    }
    return commitment.state === CommitmentState.Active;
  }
}
