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
  dueDate?: string;
  commitmentId?: string;
  goalId?: string;
}

// Demo Mode is a data-source switch checked here, at the API boundary — the
// one place allowed to know it exists. Hooks and components call the same
// tasksApi.* methods either way and never branch on demo mode themselves.
export const tasksApi = {
  list: (identityId: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoTasksRepository.list();
    return apiClient.get('tasks', { searchParams: { identityId }, signal }).json<{ data: TaskModel[] }>();
  },
  dashboard: (identityId: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoTasksRepository.dashboard();
    return apiClient.get(`tasks/dashboard/${identityId}`, { signal }).json<DashboardViewModel>();
  },
  create: (payload: CreateTaskPayload) => {
    if (isDemoModeActive()) return demoTasksRepository.create(payload);
    return apiClient.post('tasks', { json: payload }).json<{ taskId: string }>();
  },
  edit: async (id: string, payload: Partial<Pick<TaskModel, 'title' | 'description'>>): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.edit(id, payload);
    await apiClient.patch(`tasks/${id}`, { json: payload });
    return { taskId: id };
  },
  complete: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.complete(id);
    await apiClient.post(`tasks/${id}/complete`, { json: {} });
    return { taskId: id };
  },
  archive: async (id: string): Promise<{ taskId: string }> => {
    if (isDemoModeActive()) return demoTasksRepository.archive(id);
    await apiClient.post(`tasks/${id}/archive`);
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
};
