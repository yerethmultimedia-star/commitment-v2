import type { Task } from '../aggregate/Task.js';
import type { TaskId } from '../value-objects/task-id.js';

export interface TaskRepository {
  save(task: Task): Promise<number>;
  findById(id: TaskId): Promise<Task | null>;
  delete(id: TaskId): Promise<void>;
}
