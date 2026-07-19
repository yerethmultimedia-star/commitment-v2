import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack } from 'tamagui';
import { EmptyState, LoadingState } from '@commitment/design-system';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { FilterChip } from '@/features/tasks/components/FilterChip';
import { useTaskListFilterStore } from '@/features/tasks/store/use-task-list-filter.store';
import { applyTaskListFilters, countsByFilter, QUICK_FILTERS } from '@/features/tasks/utils/task-filters';

/**
 * "Tasks" sub-tab — every Task across every Goal/Commitment, flat. The
 * canonical Task list surface in the app (2026-07-19 consolidation): the
 * standalone /tasks screen was removed — it duplicated this exact list
 * behind a hidden tab (href: null since VS-031) that nothing in the
 * product actually pointed users at as a primary destination. Task List
 * UX round's quick filters (Hoy/Próximas/Bandeja/Vencidas/Completadas/
 * Todas) moved here wholesale rather than being rebuilt — same
 * task-filters.ts pipeline, same persisted store, same FilterChip.
 * Navigates to /tasks/[id] on tap (Task UX Redesign round's Detail route),
 * unaffected by the list screen's removal.
 */
export function GoalTasksFlatTab() {
  const router = useRouter();
  const { t } = useTranslation('tasks');
  const { data: tasks = [], isLoading } = useTasks();
  const quickFilter = useTaskListFilterStore((s) => s.quickFilter);
  const setQuickFilter = useTaskListFilterStore((s) => s.setQuickFilter);

  const counts = useMemo(() => countsByFilter(tasks), [tasks]);
  const filteredTasks = useMemo(
    () => applyTaskListFilters(tasks, { quickFilter }),
    [tasks, quickFilter]
  );

  if (isLoading) {
    return <LoadingState fullscreen={false} title={{ i18nKey: 'goals.list.loading' }} />;
  }

  return (
    <YStack gap="$3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" alignItems="center" paddingBottom="$2">
          {QUICK_FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={t(`quickFilters.${filter}`)}
              count={counts[filter]}
              active={quickFilter === filter}
              onPress={() => setQuickFilter(filter)}
            />
          ))}
        </XStack>
      </ScrollView>

      {filteredTasks.length === 0 ? (
        <EmptyState
          fullscreen={false}
          title={{ i18nKey: `tasks:quickFilters.empty.${quickFilter}.title` }}
          description={{ i18nKey: `tasks:quickFilters.empty.${quickFilter}.description` }}
        />
      ) : (
        filteredTasks.map((tk) => (
          <TaskCard key={tk.id} task={tk} onPress={() => router.push(`/tasks/${tk.id}` as any)} />
        ))
      )}
    </YStack>
  );
}
