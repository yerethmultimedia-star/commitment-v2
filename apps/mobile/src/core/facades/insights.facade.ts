import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export function useInsightsFacade() {
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  return {
    metrics: data?.metrics ?? { pending: 0, completedThisWeek: 0, completionRate: 0 },
    recentActivity: data?.recentActivity ?? [],
    isLoading,
    isError,
    refresh: refetch,
  };
}
