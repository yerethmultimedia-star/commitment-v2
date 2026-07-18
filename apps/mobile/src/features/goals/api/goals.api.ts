import { apiClient } from '@/core/api/api-client';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoGoalsRepository } from '@/core/demo/demo-goals.repository';
import { GoalSummary } from '../models/goal.model';

export interface CreateGoalApiPayload {
  id: string;
  identityId: string;
  title: string;
  description?: string;
}

// Demo Mode is a data-source switch checked here, at the API boundary — the
// one place allowed to know it exists. Hooks and components call the same
// goalsApi.* methods either way and never branch on demo mode themselves.
// Both branches return the exact same GoalSummary shape (see
// goal_view_alignment_assessment.md) — enrichment (progress, targetDate,
// milestones) happens one layer up, in the composition hooks, not here.
export const goalsApi = {
  list: async (): Promise<{ items: GoalSummary[]; total: number }> => {
    if (isDemoModeActive()) return demoGoalsRepository.list();
    return apiClient
      .get('goals')
      .json<{ data: GoalSummary[]; total: number }>()
      .then((res) => ({ items: res.data, total: res.total }));
  },
  getById: async (id: string): Promise<GoalSummary> => {
    if (isDemoModeActive()) return demoGoalsRepository.getById(id);
    return apiClient.get(`goals/${id}`).json<GoalSummary>();
  },
  create: async (
    payload: CreateGoalApiPayload | { title: string; description?: string }
  ): Promise<{ goalId: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.create(payload);
    const result = await apiClient
      .post('goals', { json: payload })
      .json<{ goalId: string; version: number }>();
    return { goalId: result.goalId };
  },
  // toggleMilestone deliberately NOT here — Milestone has no backend
  // equivalent yet (see milestone_domain_assessment.md); it stays a
  // demo-only mutation, called directly against demoGoalsRepository by the
  // composition hook rather than routed through this API boundary.
};
