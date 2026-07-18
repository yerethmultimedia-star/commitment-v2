import { useMemo } from 'react';
import { buildDayAgenda, DayAgenda } from '@commitment/domain';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useGoalsView } from '@/features/goals/hooks/useGoalsView';

/**
 * Assembles a CalendarContext from the same sources Today/Goals/Tasks
 * already query (no separate Calendar data model) and runs it through the
 * shared, pure buildDayAgenda — the one place this assembly happens, so
 * the Today's Agenda widget and the Calendar screen can't drift apart.
 * Milestones come from Goals (each Goal's own `.milestones`, already
 * populated by `useGoals()` — no separate milestones query exists).
 */
export function useDayAgenda(date: Date): { agenda: DayAgenda | null; isLoading: boolean } {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: commitments, isLoading: commitmentsLoading } = useCommitments();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: goals, isLoading: goalsLoading } = useGoalsView();

  const isLoading = tasksLoading || commitmentsLoading || habitsLoading || goalsLoading;

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
        milestones: (goals ?? []).flatMap((g) =>
          g.milestones.map((m) => ({
            id: m.id,
            goalId: g.id,
            title: m.title,
            targetDate: m.targetDate,
            completed: m.completed,
          }))
        ),
      },
      date
    );
  }, [tasks, commitments, habits, goals, isLoading, date]);

  return { agenda, isLoading };
}
