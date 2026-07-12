import { Injectable } from '@nestjs/common';
import { Task, TaskId } from '@commitment/domain';
import { TaskVersionedRepository } from '../application/ports/task-versioned-repository.port';

@Injectable()
export class InMemoryTaskRepository implements TaskVersionedRepository {
  private readonly store = new Map<string, Task>();
  private readonly versions = new Map<string, number>();

  /**
   * Persists the aggregate and returns the new version.
   * Version increments only when there are uncommitted events (Rule #87).
   */
  public save(task: Task): Promise<number> {
    const key = task.id.value;
    const hasNewEvents = task.getUncommittedEvents().length > 0;
    const current = this.versions.get(key) ?? 0;
    const next = hasNewEvents
      ? current + task.getUncommittedEvents().length
      : current;
    this.store.set(key, task);
    this.versions.set(key, next);
    return Promise.resolve(next);
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
}
