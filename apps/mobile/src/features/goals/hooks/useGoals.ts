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

export function useRenameGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => goalsApi.rename(id, title),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}

export function useCompleteGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.complete(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}

export function useArchiveGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.archive(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}

/** Establishes Goal.commitmentIds[] — the ADR-021 relationship, not Commitment.goalId (TECH_DEBT.md Item 10, Fase 4B). */
export function useLinkCommitmentToGoal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, commitmentId }: { goalId: string; commitmentId: string }) =>
      goalsApi.linkCommitment(goalId, commitmentId),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });
}
