import { apiClient } from '@/core/api/api-client';

interface CreateCommitmentPayload {
  title: string;
  description?: string;
  targetDate?: string;
  recurrencePattern?: string;
}

export const commitmentsApi = {
  list: async (signal?: AbortSignal) => {
    return apiClient.get('commitments', { signal }).json<{ items: any[]; total: number }>();
  },
  create: async (payload: CreateCommitmentPayload) => {
    return apiClient.post('commitments', { json: payload }).json<{ commitmentId: string }>();
  },
};
