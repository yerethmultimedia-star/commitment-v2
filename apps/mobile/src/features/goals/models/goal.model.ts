import { Milestone } from '@commitment/domain';

export type GoalState = 'Draft' | 'Active' | 'Completed' | 'Archived';

/** Raw shape returned by goals.api.ts — same fields for Demo and Backend Mode (see goal_view_alignment_assessment.md). */
export interface GoalSummary {
  id: string;
  title: string;
  description?: string;
  state: GoalState;
  commitmentIds: string[];
  habitIds: string[];
  completedAt: string | null;
}

/**
 * Composed ViewModel a screen actually renders — GoalSummary plus fields
 * derived from Commitment/Task data (progress, targetDate) via
 * computeGoalProgress(), assembled by useGoalsView()/useGoalWorkspace(),
 * never by goals.api.ts. `category`/`priority` were removed (2026-07-17,
 * see goal_view_alignment_assessment.md): presentation-only, never part of
 * the domain, unused by any real logic. `milestones` stays demo-only until
 * the Milestone Domain Assessment's open question is resolved — empty in
 * Backend Mode, not a bug.
 */
export interface GoalViewModel extends GoalSummary {
  progress: number;
  targetDate?: string;
  milestones: Milestone[];
}
