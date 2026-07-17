import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { profileApi } from '../api/profile.api';

export function useProfile() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.profile.detail(identityId ?? ''),
    queryFn: () => profileApi.getCurrentUser(identityId!),
    enabled: Boolean(identityId),
  });
}
