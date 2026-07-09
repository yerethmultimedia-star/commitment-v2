import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../api/history.api';
import { ActivityMapper } from '@/shared/mappers/activity.mapper';
import { Activity } from '@/shared/models/activity';

export const COMMITMENT_HISTORY_QUERY_KEY = (id: string) => ['commitment', id, 'history'];

export function useCommitmentHistory(commitmentId: string) {
  return useQuery<Activity[], Error>({
    queryKey: COMMITMENT_HISTORY_QUERY_KEY(commitmentId),
    queryFn: async () => {
      const data = await historyApi.getHistory(commitmentId);
      return data.map(ActivityMapper.toDomain);
    },
  });
}
