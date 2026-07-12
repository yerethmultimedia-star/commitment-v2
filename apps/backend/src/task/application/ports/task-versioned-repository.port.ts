import type { Task } from '@commitment/domain';
import type { TaskId } from '@commitment/domain';

export interface TaskVersionedRepository {
  save(task: Task): Promise<number>;
  findById(id: TaskId): Promise<Task | null>;
  delete(id: TaskId): Promise<void>;
}
