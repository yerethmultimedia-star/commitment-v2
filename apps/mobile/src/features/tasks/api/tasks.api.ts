import { apiClient } from '@/core/api/api-client';
import { DashboardViewModel, TaskModel, TaskPriority } from '../models/task.model';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoTasksRepository } from '@/core/demo/demo-tasks.repository';

export interface CreateTaskPayload {
  id: string;
  identityId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  dueDate?: string;
  commitmentId?: string;
  goalId?: string;
  // Task Capability Completion Story 6 — accepted by RegisterTaskCommand's
  // registerSchema already; no startDate here, matching the domain (Task
  // has no creation-time startDate param, only via schedule()).
  tags?: string[];
  metadata?: Record<string, any>;
}

// Demo Mode is a data-source switch checked here, at the API boundary — the
// one place allowed to know it exists. Hooks and components call the same
// tasksApi.* methods either way and never branch on demo mode themselves.
export const tasksApi = {
  list: (identityId: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoTasksRepository.list();
    return apiClient.get('tasks', { searchParams: { identityId }, signal }).json<{ data: TaskModel[] }>();
  },
  getById: (id: string, signal?: AbortSignal): Promise<TaskModel> => {
    if (isDemoModeActive()) return demoTasksRepository.getById(id);
    return apiClient.get(`tasks/${id}`, { signal }).json<TaskModel>();
  },
  dashboard: (identityId: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoTasksRepository.dashboard();
    return apiClient.get(`tasks/dashboard/${identityId}`, { signal }).json<DashboardViewModel>();
  },
  create: (payload: CreateTaskPayload) => {
    if (isDemoModeActive()) return demoTasksRepository.create(payload);
    return apiClient.post('tasks', { json: payload }).json<{ taskId: string }>();
  },
  edit: async (id: string, payload: Partial<Pick<TaskModel, 'title' | 'description' | 'estimatedMinutes' | 'tags' | 'metadata'>>): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.edit(id, payload);
    await apiClient.patch(`tasks/${id}`, { json: payload });
    return { taskId: id };
  },
  complete: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.complete(id);
    await apiClient.post(`tasks/${id}/complete`, { json: {} });
    return { taskId: id };
  },
  // ADR-022 Task Lifecycle & Execution Model — replaces the removed
  // archive/restore pair (TECH_DEBT.md Item 41). Mirrors the backend's
  // POST tasks/:id/{start,block,unblock,cancel,return-to-pending,reopen}
  // endpoints (apps/backend/src/task/api/tasks.controller.ts).
  start: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.start(id);
    await apiClient.post(`tasks/${id}/start`);
    return { taskId: id };
  },
  block: async (id: string, blockedReason?: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.block(id, blockedReason);
    await apiClient.post(`tasks/${id}/block`, { json: { blockedReason } });
    return { taskId: id };
  },
  unblock: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.unblock(id);
    await apiClient.post(`tasks/${id}/unblock`);
    return { taskId: id };
  },
  cancel: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.cancel(id);
    await apiClient.post(`tasks/${id}/cancel`);
    return { taskId: id };
  },
  returnToPending: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.returnToPending(id);
    await apiClient.post(`tasks/${id}/return-to-pending`);
    return { taskId: id };
  },
  reopen: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.reopen(id);
    await apiClient.post(`tasks/${id}/reopen`);
    return { taskId: id };
  },
  duplicate: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.duplicate(id);
    return apiClient.post(`tasks/${id}/duplicate`).json<{ taskId: string }>();
  },
  changePriority: async (id: string, priority: TaskPriority): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.changePriority(id, priority);
    await apiClient.patch(`tasks/${id}/priority`, { json: { priority } });
    return { taskId: id };
  },
  relinkGoal: async (id: string, goalId: string | null): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.relinkGoal(id, goalId);
    await apiClient.patch(`tasks/${id}/goal`, { json: { goalId } });
    return { taskId: id };
  },
  relinkCommitment: async (id: string, commitmentId: string | null): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.relinkCommitment(id, commitmentId);
    await apiClient.patch(`tasks/${id}/commitment`, { json: { commitmentId } });
    return { taskId: id };
  },
  // Task Capability Completion Story 3 — wraps the domain's Task.schedule(),
  // exposed for the first time via a new ScheduleTaskCommand + endpoint
  // (previously dueDate could only be set at creation). `dueDate: null`
  // explicitly clears it, matching relinkGoal/relinkCommitment's own
  // explicit-null convention — always pass it, never omit.
  //
  // Story 6 fix: `startDate` is now a required (not optional) third
  // parameter, closing a real bug found during Story 6's verification —
  // the backend controller resolves an omitted startDate to `null`
  // (`parsed.data.startDate ?? null`), so every prior schedule() call
  // (which only ever sent dueDate) was silently clearing startDate on
  // every reschedule. Callers must now explicitly pass the task's current
  // startDate to preserve it, or null to intentionally clear it.
  schedule: async (id: string, dueDate: string | null, startDate: string | null): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.schedule(id, dueDate, startDate);
    await apiClient.patch(`tasks/${id}/schedule`, { json: { dueDate, startDate } });
    return { taskId: id };
  },
};
