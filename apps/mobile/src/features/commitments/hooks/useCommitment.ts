import { useQuery } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { commitmentMapper } from '../mappers/commitment.mapper';
import { queryKeys } from '@/core/query/query-keys';

export function useCommitment(id: string) {
  return useQuery({
    queryKey: queryKeys.commitments.detail(id),
    queryFn: async ({ signal }) => {
      const dto = await commitmentsApi.getById(id, signal);
      return commitmentMapper.fromDTO(dto);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}
