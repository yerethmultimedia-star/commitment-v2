import { demoGoalsRepository } from '@/core/demo/demo-goals.repository';

interface CreateGoalPayload {
  title: string;
  description?: string;
}

// Goal has no backend module yet (packages/domain/src/goal ships the
// Aggregate Root; the repository there is an interface only — see
// GoalRepository). Every method routes to the in-memory demo repository
// regardless of Demo Mode until a real backend Goal module exists, so this
// always reflects that, rather than pointing at a network call that would
// just 404. Swap this for the isDemoModeActive() branch used by
// commitments.api.ts once that module ships.
export const goalsApi = {
  list: async () => demoGoalsRepository.list(),
  getById: async (id: string) => demoGoalsRepository.getById(id),
  create: async (payload: CreateGoalPayload) => demoGoalsRepository.create(payload),
  toggleMilestone: async (id: string) => demoGoalsRepository.toggleMilestone(id),
};
