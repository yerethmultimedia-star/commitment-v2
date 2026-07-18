import { useMemo } from 'react';
import { useGoals, useGoal } from './useGoals';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoGoalsRepository } from '@/core/demo/demo-goals.repository';
import { composeGoalView } from '../utils/compose-goal-view';
import { GoalViewModel } from '../models/goal.model';

/**
 * Milestones only exist in Demo Mode today (milestone_domain_assessment.md
 * — not a "same feature, two sources" case, an unbuilt backend concept), so
 * this is the one legitimate demo-mode check in the composition layer.
 */
function milestonesFor(goalId: string) {
  return isDemoModeActive() ? demoGoalsRepository.getMilestonesFor(goalId) : [];
}

/** List-level GoalViewModel[] — composes useGoals() with useCommitments()/useTasks() via computeGoalProgress(). */
export function useGoalsView() {
  const goalsQuery = useGoals();
  const commitmentsQuery = useCommitments();
  const tasksQuery = useTasks();

  const isLoading = goalsQuery.isLoading || commitmentsQuery.isLoading || tasksQuery.isLoading;
  const isError = goalsQuery.isError || commitmentsQuery.isError || tasksQuery.isError;

  const data = useMemo((): GoalViewModel[] | undefined => {
    if (!goalsQuery.data) return undefined;
    const commitments = commitmentsQuery.data ?? [];
    const tasks = tasksQuery.data ?? [];
    return goalsQuery.data.map((goal) =>
      composeGoalView(goal, commitments, tasks, milestonesFor(goal.id))
    );
  }, [goalsQuery.data, commitmentsQuery.data, tasksQuery.data]);

  return { data, isLoading, isError, refetch: goalsQuery.refetch };
}

/** Single-Goal GoalViewModel for GoalWorkspaceScreen — same composition as useGoalsView(), one Goal. */
export function useGoalWorkspace(goalId: string | undefined) {
  const goalQuery = useGoal(goalId);
  const commitmentsQuery = useCommitments();
  const tasksQuery = useTasks();

  const isLoading = goalQuery.isLoading || commitmentsQuery.isLoading || tasksQuery.isLoading;
  const isError = goalQuery.isError || commitmentsQuery.isError || tasksQuery.isError;

  const data = useMemo((): GoalViewModel | undefined => {
    if (!goalQuery.data) return undefined;
    return composeGoalView(
      goalQuery.data,
      commitmentsQuery.data ?? [],
      tasksQuery.data ?? [],
      milestonesFor(goalQuery.data.id)
    );
  }, [goalQuery.data, commitmentsQuery.data, tasksQuery.data]);

  return { data, isLoading, isError };
}
