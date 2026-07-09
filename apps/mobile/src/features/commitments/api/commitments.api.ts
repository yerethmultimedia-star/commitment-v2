import { apiClient } from '@/core/api/api-client';

export const commitmentsApi = {
  list: async (signal?: AbortSignal) => {
    return apiClient.get('commitments', { signal }).json<{ items: any[]; total: number }>();
  },
};
