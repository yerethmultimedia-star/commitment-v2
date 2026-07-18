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
  rename: async (id: string, title: string): Promise<{ goalId: string; title: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.rename(id, title);
    const result = await apiClient
      .patch(`goals/${id}`, { json: { title } })
      .json<{ goalId: string; title: string; version: number }>();
    return { goalId: result.goalId, title: result.title };
  },
  // Goal Draft Editing (follow-up to Decisión B): the only way a Goal
  // created via Quick Capture (title only) can ever satisfy activate()'s
  // description invariant.
  updateDescription: async (id: string, description: string): Promise<{ goalId: string; description: string | null }> => {
    if (isDemoModeActive()) return demoGoalsRepository.updateDescription(id, description);
    const result = await apiClient
      .patch(`goals/${id}/description`, { json: { description } })
      .json<{ goalId: string; description: string | null; version: number }>();
    return { goalId: result.goalId, description: result.description };
  },
  // Decisión B, Goal Lifecycle: Draft -> Active. The backend rejects this
  // (409) unless the Goal has a description and at least one linked
  // Commitment — Demo Mode enforces the same invariants (see
  // demo-goals.repository.ts) rather than silently diverging.
  activate: async (id: string): Promise<{ goalId: string; state: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.activate(id);
    const result = await apiClient
      .post(`goals/${id}/activate`)
      .json<{ goalId: string; state: string; version: number }>();
    return { goalId: result.goalId, state: result.state };
  },
  complete: async (id: string): Promise<{ goalId: string; state: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.complete(id);
    const result = await apiClient
      .post(`goals/${id}/complete`)
      .json<{ goalId: string; state: string; version: number }>();
    return { goalId: result.goalId, state: result.state };
  },
  archive: async (id: string): Promise<{ goalId: string; state: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.archive(id);
    const result = await apiClient
      .post(`goals/${id}/archive`)
      .json<{ goalId: string; state: string; version: number }>();
    return { goalId: result.goalId, state: result.state };
  },
  // Establishes the Goal-owned relationship ADR-021 designed
  // (Goal.commitmentIds[]/linkCommitment) — replaces the old
  // Commitment.goalId/relinkGoal flow, which never had a real backend
  // (TECH_DEBT.md Item 10, Fase 4B). Linking only — there is no backend
  // "unlink" command yet, so this cannot remove a link once made.
  linkCommitment: async (goalId: string, commitmentId: string): Promise<{ goalId: string }> => {
    if (isDemoModeActive()) return demoGoalsRepository.linkCommitment(goalId, commitmentId);
    await apiClient.post(`goals/${goalId}/commitments`, { json: { commitmentId } });
    return { goalId };
  },
  // toggleMilestone deliberately NOT here — Milestone has no backend
  // equivalent yet (see milestone_domain_assessment.md); it stays a
  // demo-only mutation, called directly against demoGoalsRepository by the
  // composition hook rather than routed through this API boundary.
};
