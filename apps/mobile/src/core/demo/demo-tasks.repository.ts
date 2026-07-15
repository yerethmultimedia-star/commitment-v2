import { demoTasks, getDemoDashboard, DEMO_IDENTITY_ID } from './demo-data';
import { TaskModel, TaskPriority } from '@/features/tasks/models/task.model';

/**
 * Demo-mode implementation mirroring tasks.api.ts. Mutates the in-memory
 * demo dataset directly so the Tasks screen (create/complete/archive/
 * duplicate/reprioritize) stays interactive during a demo, without a
 * backend.
 */
function findOrThrow(id: string): TaskModel {
  const task = demoTasks.find((t) => t.id === id);
  if (!task) throw new Error(`Demo task not found: ${id}`);
  return task;
}

let demoTaskCounter = demoTasks.length;

export const demoTasksRepository = {
  list: async () => ({ data: demoTasks }),

  dashboard: async () => getDemoDashboard(),

  create: async (payload: { id?: string; title: string; description?: string; priority?: TaskPriority; dueDate?: string; commitmentId?: string }) => {
    demoTaskCounter += 1;
    const id = payload.id ?? `t-demo-${demoTaskCounter}`;
    demoTasks.unshift({
      id,
      identityId: DEMO_IDENTITY_ID,
      title: payload.title,
      description: payload.description ?? '',
      status: 'pending',
      priority: payload.priority ?? 'medium',
      estimatedMinutes: 20,
      actualMinutes: 0,
      dueDate: payload.dueDate ?? new Date().toISOString(),
      commitmentId: payload.commitmentId ?? null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    return { taskId: id };
  },

  edit: async (id: string, payload: Partial<Pick<TaskModel, 'title' | 'description'>>) => {
    const task = findOrThrow(id);
    if (payload.title !== undefined) task.title = payload.title;
    if (payload.description !== undefined) task.description = payload.description ?? '';
    return { taskId: id };
  },

  complete: async (id: string) => {
    const task = findOrThrow(id);
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.actualMinutes = task.estimatedMinutes;
    return { taskId: id };
  },

  archive: async (id: string) => {
    const task = findOrThrow(id);
    task.status = 'archived';
    return { taskId: id };
  },

  duplicate: async (id: string) => {
    const source = findOrThrow(id);
    demoTaskCounter += 1;
    const id2 = `t-demo-${demoTaskCounter}`;
    demoTasks.unshift({
      ...source,
      id: id2,
      status: 'pending',
      completedAt: null,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
    });
    return { taskId: id2 };
  },

  changePriority: async (id: string, priority: TaskPriority) => {
    const task = findOrThrow(id);
    task.priority = priority;
    return { taskId: id };
  },
};
