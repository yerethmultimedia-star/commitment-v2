import { useDashboardQuery } from '@/features/tasks/hooks/useTasks';

export function useDashboardFacade() {
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  return {
    dashboard: data,
    isLoading,
    isError,
    refresh: refetch,
  };
}
