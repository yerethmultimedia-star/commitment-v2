import { apiClient } from '@/core/api/api-client';
import { ActivityDto } from '@/shared/mappers/activity.mapper';

export const historyApi = {
  getHistory: async (commitmentId: string): Promise<ActivityDto[]> => {
    const response = await apiClient.get(`/commitments/${commitmentId}/history`);
    return await response.json<ActivityDto[]>();
  },
};
