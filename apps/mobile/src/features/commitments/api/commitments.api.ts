import { apiClient } from '@/core/api/api-client';

interface CreateCommitmentPayload {
  title: string;
  description?: string;
  targetDate?: string;
  recurrencePattern?: string;
}

interface EditCommitmentPayload {
  title?: string;
  description?: string;
  targetDate?: string | null;
  recurrencePattern?: string | null;
}

interface TransitionResult {
  commitmentId: string;
  state: string;
  version: number;
}

export const commitmentsApi = {
  list: async (signal?: AbortSignal) => {
    return apiClient.get('commitments', { signal }).json<{ items: any[]; total: number }>();
  },
  getById: async (id: string, signal?: AbortSignal) => {
    return apiClient.get(`commitments/${id}`, { signal }).json<any>();
  },
  create: async (payload: CreateCommitmentPayload) => {
    return apiClient.post('commitments', { json: payload }).json<{ commitmentId: string }>();
  },
  edit: async (id: string, payload: EditCommitmentPayload) => {
    return apiClient.patch(`commitments/${id}`, { json: payload }).json<{ commitmentId: string }>();
  },
  activate: async (id: string) => {
    return apiClient.post(`commitments/${id}/activate`).json<TransitionResult>();
  },
  pause: async (id: string) => {
    return apiClient.post(`commitments/${id}/pause`).json<TransitionResult>();
  },
  resume: async (id: string) => {
    return apiClient.post(`commitments/${id}/resume`).json<TransitionResult>();
  },
  complete: async (id: string) => {
    return apiClient.post(`commitments/${id}/complete`).json<TransitionResult>();
  },
  cancel: async (id: string) => {
    return apiClient.post(`commitments/${id}/cancel`).json<TransitionResult>();
  },
};
