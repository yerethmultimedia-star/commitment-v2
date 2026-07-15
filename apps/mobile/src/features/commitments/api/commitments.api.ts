import { apiClient } from '@/core/api/api-client';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoCommitmentsRepository } from '@/core/demo/demo-commitments.repository';

interface CreateCommitmentPayload {
  title: string;
  description?: string;
  targetDate?: string;
  recurrencePattern?: string;
  priority?: string;
}

interface EditCommitmentPayload {
  title?: string;
  description?: string;
  targetDate?: string | null;
  recurrencePattern?: string | null;
  priority?: string;
}

interface TransitionResult {
  commitmentId: string;
  state: string;
  version: number;
}

// Demo Mode is a data-source switch checked here, at the API boundary — the
// one place allowed to know it exists. Hooks and components call the same
// commitmentsApi.* methods either way and never branch on demo mode
// themselves.
export const commitmentsApi = {
  list: async (signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.list();
    return apiClient.get('commitments', { signal }).json<{ items: any[]; total: number }>();
  },
  getById: async (id: string, signal?: AbortSignal) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.getById(id);
    return apiClient.get(`commitments/${id}`, { signal }).json<any>();
  },
  create: async (payload: CreateCommitmentPayload) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.create(payload);
    return apiClient.post('commitments', { json: payload }).json<{ commitmentId: string }>();
  },
  edit: async (id: string, payload: EditCommitmentPayload) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.edit(id, payload);
    return apiClient.patch(`commitments/${id}`, { json: payload }).json<{ commitmentId: string }>();
  },
  activate: async (id: string) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.transition(id, 'activate') as Promise<TransitionResult>;
    return apiClient.post(`commitments/${id}/activate`).json<TransitionResult>();
  },
  pause: async (id: string) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.transition(id, 'pause') as Promise<TransitionResult>;
    return apiClient.post(`commitments/${id}/pause`).json<TransitionResult>();
  },
  resume: async (id: string) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.transition(id, 'resume') as Promise<TransitionResult>;
    return apiClient.post(`commitments/${id}/resume`).json<TransitionResult>();
  },
  complete: async (id: string) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.transition(id, 'complete') as Promise<TransitionResult>;
    return apiClient.post(`commitments/${id}/complete`).json<TransitionResult>();
  },
  cancel: async (id: string) => {
    if (isDemoModeActive()) return demoCommitmentsRepository.transition(id, 'cancel') as Promise<TransitionResult>;
    return apiClient.post(`commitments/${id}/cancel`).json<TransitionResult>();
  },
};
