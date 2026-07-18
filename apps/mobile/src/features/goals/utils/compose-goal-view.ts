import { computeGoalProgress, Milestone } from '@commitment/domain';
import { CommitmentModel } from '@/features/commitments/models/commitment.model';
import { TaskModel } from '@/features/tasks/models/task.model';
import { GoalSummary, GoalViewModel } from '../models/goal.model';

function commitmentProgressRatio(commitmentId: string, tasks: TaskModel[]): number {
  const linked = tasks.filter((t) => t.commitmentId === commitmentId);
  if (linked.length === 0) return 0;
  return linked.filter((t) => t.status === 'completed').length / linked.length;
}

/** Latest target date among a Goal's linked commitments — never a separately invented date. */
function deriveTargetDate(goal: GoalSummary, commitments: CommitmentModel[]): string | undefined {
  const dates = goal.commitmentIds
    .map((id) => commitments.find((c) => c.id === id)?.targetDate)
    .filter((d): d is string => Boolean(d));
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest));
}

/**
 * Assembles the ViewModel a Goal screen actually renders from a GoalSummary
 * (goals.api.ts, identical shape for Demo/Backend Mode) plus already-fetched
 * Commitment/Task data — same computeGoalProgress() pure function either
 * way (see goal_view_alignment_assessment.md). Called by useGoalsView()/
 * useGoalWorkspace(), never by a screen or goals.api.ts directly.
 */
export function composeGoalView(
  goal: GoalSummary,
  commitments: CommitmentModel[],
  tasks: TaskModel[],
  milestones: Milestone[]
): GoalViewModel {
  const commitmentProgressRatios = goal.commitmentIds.map((id) => commitmentProgressRatio(id, tasks));
  const progress = computeGoalProgress({ commitmentProgressRatios, milestones });
  return { ...goal, progress, targetDate: deriveTargetDate(goal, commitments), milestones };
}
