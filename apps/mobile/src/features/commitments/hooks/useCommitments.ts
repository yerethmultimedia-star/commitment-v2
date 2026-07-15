import { useQuery } from '@tanstack/react-query';
import { commitmentsApi } from '../api/commitments.api';
import { commitmentMapper } from '../mappers/commitment.mapper';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';

export function useCommitments() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.commitments.list(),
    queryFn: async ({ signal }) => {
      const response = await commitmentsApi.list(signal);
      const items = response.items || (response as any).data || [];
      return items.map(commitmentMapper.fromDTO);
    },
    // Every other dashboard-facing query gates on identityId (see useTasks.ts) —
    // this one didn't, so it could fire before auth hydration finished and the
    // x-identity-id header was ever set. Kept unguarded, this was the other half
    // of the race documented in useDashboardContext.ts.
    enabled: Boolean(identityId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
