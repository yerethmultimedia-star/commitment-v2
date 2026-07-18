import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/query/query-keys';
import { useSession } from '@/core/auth/use-session';
import { goalsApi } from '../api/goals.api';
import { demoGoalsRepository } from '@/core/demo/demo-goals.repository';

/** Raw GoalSummary list — same shape for Demo/Backend Mode, no progress/targetDate/milestones. Use useGoalsView() for the enriched ViewModel a screen renders. */
export function useGoals() {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.goals.list,
    queryFn: () => goalsApi.list().then((result) => result.items),
    enabled: Boolean(identityId),
  });
}

export function useGoal(id: string | undefined) {
  const { identityId } = useSession();
  return useQuery({
    queryKey: queryKeys.goals.detail(id ?? ''),
    queryFn: () => goalsApi.getById(id!),
    enabled: Boolean(identityId) && Boolean(id),
  });
}

/**
 * Demo-only — Milestone has no backend equivalent yet
 * (milestone_domain_assessment.md), so this bypasses goals.api.ts and calls
 * demoGoalsRepository directly rather than adding a fake real-mode branch.
 */
export function useToggleMilestone() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demoGoalsRepository.toggleMilestone(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}
