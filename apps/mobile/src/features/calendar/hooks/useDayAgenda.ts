import { useMemo } from 'react';
import { buildDayAgenda, DayAgenda } from '@commitment/domain';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useHabits } from '@/features/habits/hooks/useHabits';

/**
 * Assembles a CalendarContext from the same sources Today/Goals/Tasks
 * already query (no separate Calendar data model) and runs it through the
 * shared, pure buildDayAgenda — the one place this assembly happens, so
 * the Today's Agenda widget and the Calendar screen can't drift apart.
 */
export function useDayAgenda(date: Date): { agenda: DayAgenda | null; isLoading: boolean } {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: commitments, isLoading: commitmentsLoading } = useCommitments();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const isLoading = tasksLoading || commitmentsLoading || habitsLoading;

  const agenda = useMemo(() => {
    if (isLoading) return null;
    return buildDayAgenda(
      {
        tasks: (tasks ?? []).map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate ?? undefined,
          completed: t.status === 'completed',
          estimatedMinutes: t.estimatedMinutes,
        })),
        commitments: (commitments ?? []).map((c) => ({
          id: c.id,
          title: c.title,
          targetDate: c.targetDate,
          completed: c.status === 'completed',
        })),
        habits: habits ?? [],
      },
      date
    );
  }, [tasks, commitments, habits, isLoading, date]);

  return { agenda, isLoading };
}
