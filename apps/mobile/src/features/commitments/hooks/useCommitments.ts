import { useQuery } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { commitmentMapper } from '../mappers/commitment.mapper';
import { queryKeys } from '@/core/query/query-keys';

export function useCommitments() {
  return useQuery({
    queryKey: queryKeys.commitments.list(),
    queryFn: async ({ signal }) => {
      const response = await commitmentsApi.list(signal);
      return response.items.map(commitmentMapper.fromDTO);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
