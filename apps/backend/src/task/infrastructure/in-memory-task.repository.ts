import { Injectable } from '@nestjs/common';
import { Task, TaskId, CommitmentId } from '@commitment/domain';
import { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';
import { getLoadedVersion } from '../../infrastructure/versioning/loaded-version';
import { OptimisticConcurrencyError } from '../../infrastructure/errors/optimistic-concurrency.error';

@Injectable()
export class InMemoryTaskRepository implements TaskVersionedRepository {
  private readonly store = new Map<string, Task>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns its version, enforcing optimistic
   * concurrency (AR-028). The repository never computes a new version — it
   * only reads `task.version` (owned by the Aggregate) and records it.
   */
  public async save(task: Task): Promise<number> {
    await Promise.resolve();
    const key = task.id.value;
    const loadedVersion = getLoadedVersion(task);
    const storedVersion = this.versions.get(key) ?? 0;

    if (loadedVersion !== storedVersion) {
      throw new OptimisticConcurrencyError(key, loadedVersion, storedVersion);
    }

    this.store.set(key, task);
    this.versions.set(key, task.version);
    return task.version;
  }

  public findById(id: TaskId): Promise<Task | null> {
    const task = this.store.get(id.value);
    return Promise.resolve(task ?? null);
  }

  public delete(id: TaskId): Promise<void> {
    this.store.delete(id.value);
    this.versions.delete(id.value);
    return Promise.resolve();
  }

  public findByCommitmentId(commitmentId: CommitmentId): Promise<Task[]> {
    const tasks = Array.from(this.store.values()).filter(
      (task) =>
        !task.isDeleted && task.commitmentId?.value === commitmentId.value,
    );
    return Promise.resolve(tasks);
  }
}
