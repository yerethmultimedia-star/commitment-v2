import { demoTasks, replaceDemoTasks, getDemoDashboard, DEMO_IDENTITY_ID } from './demo-data';
import { TaskModel, TaskPriority } from '@/features/tasks/models/task.model';

/**
 * Demo-mode implementation mirroring tasks.api.ts. Every mutating method
 * builds a NEW array via replaceDemoTasks() rather than mutating demoTasks
 * or a task object in place — required for React Query's refetch() and
 * React's useMemo (both keyed on referential equality) to actually detect
 * the change (see replaceDemoTasks's doc comment in demo-data.ts for the
 * bug this avoids).
 */
function findOrThrow(id: string): TaskModel {
  const task = demoTasks.find((t) => t.id === id);
  if (!task) throw new Error(`Demo task not found: ${id}`);
  return task;
}

/** Replaces one task by id with an updated copy, via a new array reference. */
function replace(id: string, updates: Partial<TaskModel>): TaskModel {
  const updated = { ...findOrThrow(id), ...updates };
  replaceDemoTasks(demoTasks.map((t) => (t.id === id ? updated : t)));
  return updated;
}

let demoTaskCounter = demoTasks.length;
// Mirrors the backend's internal (non-public) preBlockStatus field (ADR-022
// §4.2) — Unblock must restore the exact prior operational status.
const preBlockStatus = new Map<string, 'pending' | 'in_progress'>();

export const demoTasksRepository = {
  list: async () => ({ data: demoTasks }),

  dashboard: async () => getDemoDashboard(),

  create: async (payload: { id?: string; title: string; description?: string; priority?: TaskPriority; dueDate?: string; commitmentId?: string; goalId?: string }) => {
    demoTaskCounter += 1;
    const id = payload.id ?? `t-demo-${demoTaskCounter}`;
    const task: TaskModel = {
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
      goalId: payload.goalId ?? null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    replaceDemoTasks([task, ...demoTasks]);
    return { taskId: id };
  },

  edit: async (id: string, payload: Partial<Pick<TaskModel, 'title' | 'description'>>) => {
    const updates: Partial<TaskModel> = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.description !== undefined) updates.description = payload.description ?? '';
    replace(id, updates);
    return { taskId: id };
  },

  complete: async (id: string) => {
    const task = findOrThrow(id);
    replace(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualMinutes: task.estimatedMinutes,
    });
    return { taskId: id };
  },

  // ADR-022 Task Lifecycle & Execution Model — replaces archive/restore
  // (TECH_DEBT.md Item 41). Demo Mode has no dependency graph of its own
  // (TaskDependency is backend/Fase 2.2 architecture-only, no UI), so every
  // block here is 'manual' — there is no automatic dependency-block/unblock
  // simulation in Demo Mode.
  start: async (id: string) => {
    replace(id, { status: 'in_progress' });
    return { taskId: id };
  },

  block: async (id: string, blockedReason?: string) => {
    const task = findOrThrow(id);
    replace(id, {
      status: 'blocked',
      blockedType: 'manual',
      blockedReason: blockedReason ?? null,
      // Remembered only in-memory via closure below, not persisted on the
      // model (mirrors the backend's internal, non-public preBlockStatus) —
      // see unblock() for how it's recovered.
    });
    preBlockStatus.set(id, task.status === 'in_progress' ? 'in_progress' : 'pending');
    return { taskId: id };
  },

  unblock: async (id: string) => {
    const resultingStatus = preBlockStatus.get(id) ?? 'pending';
    preBlockStatus.delete(id);
    replace(id, { status: resultingStatus, blockedType: null, blockedReason: null });
    return { taskId: id };
  },

  cancel: async (id: string) => {
    replace(id, { status: 'cancelled' });
    return { taskId: id };
  },

  returnToPending: async (id: string) => {
    replace(id, { status: 'pending' });
    return { taskId: id };
  },

  reopen: async (id: string) => {
    replace(id, { status: 'pending', completedAt: null, blockedType: null, blockedReason: null });
    return { taskId: id };
  },

  duplicate: async (id: string) => {
    const source = findOrThrow(id);
    demoTaskCounter += 1;
    const id2 = `t-demo-${demoTaskCounter}`;
    const copy: TaskModel = {
      ...source,
      id: id2,
      status: 'pending',
      completedAt: null,
      blockedType: null,
      blockedReason: null,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    replaceDemoTasks([copy, ...demoTasks]);
    return { taskId: id2 };
  },

  changePriority: async (id: string, priority: TaskPriority) => {
    replace(id, { priority });
    return { taskId: id };
  },

  // Mutually exclusive with commitmentId, mirroring the Task domain
  // invariant — linking a Goal directly clears any Commitment link, since
  // a Commitment's own Goal (if any) is resolved for display, never stored
  // on the task twice. See relinkCommitment() below for the reverse case.
  relinkGoal: async (id: string, goalId: string | null) => {
    replace(id, { goalId, ...(goalId !== null ? { commitmentId: null } : {}) });
    return { taskId: id };
  },

  relinkCommitment: async (id: string, commitmentId: string | null) => {
    replace(id, { commitmentId, ...(commitmentId !== null ? { goalId: null } : {}) });
    return { taskId: id };
  },
};
