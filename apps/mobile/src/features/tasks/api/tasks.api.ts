import { apiClient } from '@/core/api/api-client';
import { DashboardViewModel, TaskModel, TaskPriority } from '../models/task.model';

export interface CreateTaskPayload {
  id: string;
  identityId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  commitmentId?: string;
}

export const tasksApi = {
  list: (identityId: string, signal?: AbortSignal) => apiClient.get('tasks', { searchParams: { identityId }, signal }).json<{ data: TaskModel[] }>(),
  dashboard: (identityId: string, signal?: AbortSignal) => apiClient.get(`tasks/dashboard/${identityId}`, { signal }).json<DashboardViewModel>(),
  create: (payload: CreateTaskPayload) => apiClient.post('tasks', { json: payload }).json<{ taskId: string }>(),
  edit: (id: string, payload: Partial<Pick<TaskModel, 'title' | 'description'>>) => apiClient.patch(`tasks/${id}`, { json: payload }),
  complete: (id: string) => apiClient.post(`tasks/${id}/complete`, { json: {} }),
  archive: (id: string) => apiClient.post(`tasks/${id}/archive`),
  duplicate: (id: string) => apiClient.post(`tasks/${id}/duplicate`).json<{ taskId: string }>(),
  changePriority: (id: string, priority: TaskPriority) => apiClient.patch(`tasks/${id}/priority`, { json: { priority } }),
};
