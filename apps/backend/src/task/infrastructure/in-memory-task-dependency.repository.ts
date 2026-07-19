import { Injectable } from '@nestjs/common';
import { TaskDependency, TaskId } from '@commitment/domain';
import { TaskDependencyRepository } from '../application/ports/task-dependency-repository.port';

@Injectable()
export class InMemoryTaskDependencyRepository implements TaskDependencyRepository {
  private readonly store = new Map<string, TaskDependency>();

  public save(dependency: TaskDependency): Promise<void> {
    this.store.set(dependency.id, dependency);
    return Promise.resolve();
  }

  public findAll(): Promise<TaskDependency[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  public findByPredecessorId(taskId: TaskId): Promise<TaskDependency[]> {
    const deps = Array.from(this.store.values()).filter(
      (dep) => dep.predecessorTaskId.value === taskId.value,
    );
    return Promise.resolve(deps);
  }

  public findBySuccessorId(taskId: TaskId): Promise<TaskDependency[]> {
    const deps = Array.from(this.store.values()).filter(
      (dep) => dep.successorTaskId.value === taskId.value,
    );
    return Promise.resolve(deps);
  }
}
