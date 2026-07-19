import { Milestone } from '@commitment/domain';
import { demoCommitmentDTOs, daysAgo } from './demo-data';
import { GoalSummary } from '@/features/goals/models/goal.model';

export interface DemoGoalDTO extends GoalSummary {
  /** Dataset content only (see DEMO_DATASET.md's "The 7 Goals" table) — not
   * exposed by list()/getById() since neither is a real domain concept
   * (goal_view_alignment_assessment.md). Kept here in case a future product
   * decision reintroduces categorization. */
  category: 'health' | 'career' | 'finance' | 'learning' | 'personal';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

/**
 * The canonical demo dataset's top-level entity. Every Goal below links
 * ONLY to Commitments/Habits/Tasks that already exist in demo-data.ts /
 * demo-habits.repository.ts — no parallel content invented to fill this
 * screen. See docs/DEMO_DATASET.md for the frozen contract (relationships,
 * quantities, consistency rules) this dataset follows.
 */
const demoGoalDTOs: DemoGoalDTO[] = [
  {
    id: 'g-01', title: 'Improve Physical Health', category: 'health', priority: 'high', state: 'Active',
    description: 'Build a body and a routine that can keep up with everything else.',
    commitmentIds: ['c-01', 'c-03', 'c-12', 'c-15'],
    habitIds: ['h-01', 'h-05', 'h-07'],
    createdAt: '2026-05-01T00:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'g-02', title: 'Improve Mental Wellbeing', category: 'personal', priority: 'medium', state: 'Active',
    description: 'Make space to slow down — a clearer mind and a clearer home.',
    commitmentIds: ['c-09', 'c-10'],
    habitIds: ['h-02'],
    createdAt: '2026-05-05T00:00:00.000Z',
    completedAt: null,
  },
  {
    // Completed in "last week" (per §2b) so Objetivos completados has real week-over-week density.
    id: 'g-03', title: 'Build Financial Freedom', category: 'finance', priority: 'high', state: 'Completed',
    description: 'A real safety net, and a real plan for the next big purchase.',
    commitmentIds: ['c-04', 'c-13'],
    habitIds: [],
    createdAt: '2026-04-20T00:00:00.000Z',
    completedAt: daysAgo(10),
  },
  {
    id: 'g-04', title: 'Become More Productive', category: 'career', priority: 'high', state: 'Active',
    description: 'Ship what matters, on a rhythm that does not burn out.',
    commitmentIds: ['c-02', 'c-08', 'c-11', 'c-14'],
    habitIds: ['h-04'],
    createdAt: '2026-04-10T00:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'g-05', title: 'Learn Portuguese', category: 'learning', priority: 'low', state: 'Active',
    description: 'Enough conversational Portuguese to get by on the next trip.',
    commitmentIds: ['c-06', 'c-16'],
    habitIds: ['h-03', 'h-08'],
    createdAt: '2026-05-12T00:00:00.000Z',
    completedAt: null,
  },
  {
    // Completed "this week" (per §2b) so Objetivos completados has a non-zero current-week count.
    id: 'g-06', title: 'Keep Reading', category: 'learning', priority: 'low', state: 'Completed',
    description: '24 books this year — one good habit, read consistently.',
    commitmentIds: ['c-05'],
    habitIds: ['h-06'],
    createdAt: '2026-05-15T00:00:00.000Z',
    completedAt: daysAgo(3),
  },
  {
    id: 'g-07', title: 'Build Better Relationships', category: 'personal', priority: 'medium', state: 'Active',
    description: 'Put real time back into the friendships that matter.',
    commitmentIds: ['c-07', 'c-17'],
    habitIds: ['h-09'],
    createdAt: '2026-05-20T00:00:00.000Z',
    completedAt: null,
  },
];

/** A Milestone's targetDate, when it has one, is always the date of an existing linked Commitment describing the same real-world event — never an independently invented date (see DEMO_DATASET.md's "no independently-random numbers" rule). */
function commitmentTargetDate(commitmentId: string): string | undefined {
  return demoCommitmentDTOs.find((c) => c.id === commitmentId)?.targetDate;
}

let demoMilestones: Milestone[] = [
  { id: 'm-01', goalId: 'g-01', title: 'Complete a 5K without stopping', completed: true },
  { id: 'm-02', goalId: 'g-01', title: 'Run 15K in training', completed: true },
  // Same event as Commitment c-01 ("Train for the half marathon").
  { id: 'm-03', goalId: 'g-01', title: 'Finish the half marathon', completed: false, targetDate: commitmentTargetDate('c-01') },

  { id: 'm-04', goalId: 'g-02', title: 'Set up a meditation corner', completed: true },
  { id: 'm-05', goalId: 'g-02', title: 'Meditate 7 days in a row', completed: false },
  { id: 'm-06', goalId: 'g-02', title: 'Declutter the bedroom', completed: false },

  { id: 'm-07', goalId: 'g-03', title: 'Save the first $1,000', completed: true },
  { id: 'm-08', goalId: 'g-03', title: 'Fully fund the emergency fund', completed: true },
  { id: 'm-09', goalId: 'g-03', title: 'Reach 50% of the down payment goal', completed: false },

  { id: 'm-10', goalId: 'g-04', title: 'Ship the v2 beta', completed: true },
  { id: 'm-11', goalId: 'g-04', title: 'Complete the onboarding audit', completed: true },
  // Same event as Commitment c-08 ("Push the mobile redesign forward").
  { id: 'm-12', goalId: 'g-04', title: 'Launch the redesigned website', completed: false, targetDate: commitmentTargetDate('c-08') },

  { id: 'm-13', goalId: 'g-05', title: 'Finish the beginner course', completed: true },
  { id: 'm-14', goalId: 'g-05', title: 'Hold a 5-minute conversation', completed: false },
  { id: 'm-19', goalId: 'g-05', title: 'Watch a movie without subtitles', completed: false },

  { id: 'm-15', goalId: 'g-06', title: 'Finish the first 6 books', completed: true },
  { id: 'm-16', goalId: 'g-06', title: 'Reach 12 books — halfway', completed: false },

  { id: 'm-17', goalId: 'g-07', title: 'Reconnect with 3 friends', completed: true },
  { id: 'm-18', goalId: 'g-07', title: 'Plan a group reunion', completed: false },
  { id: 'm-20', goalId: 'g-07', title: 'Host the first gathering', completed: false },
];

function findOrThrow(id: string) {
  const dto = demoGoalDTOs.find((g) => g.id === id);
  if (!dto) throw new Error(`Demo goal not found: ${id}`);
  return dto;
}

function findMilestoneOrThrow(id: string): Milestone {
  const milestone = demoMilestones.find((m) => m.id === id);
  if (!milestone) throw new Error(`Demo milestone not found: ${id}`);
  return milestone;
}

/** Strips demo-only fields (category/priority/createdAt) down to the shape goals.api.ts's real branch returns. */
function toSummary(dto: DemoGoalDTO): GoalSummary {
  const { id, title, description, state, commitmentIds, habitIds, completedAt } = dto;
  return { id, title, description, state, commitmentIds, habitIds, completedAt };
}

export const demoGoalsRepository = {
  list: async (): Promise<{ items: GoalSummary[]; total: number }> => {
    const items = demoGoalDTOs.map(toSummary);
    return { items, total: items.length };
  },

  getById: async (id: string): Promise<GoalSummary> => toSummary(findOrThrow(id)),

  // Decisión B, Goal Lifecycle: matches Goal.register() on the real backend
  // (starts in Draft, not Active) — no shortcut here, so a Draft Goal is
  // genuinely reachable and testable in Demo Mode too, same as the real app.
  create: async (payload: { id?: string; title: string; description?: string }): Promise<{ goalId: string }> => {
    // Quick Capture generates its own id client-side and navigates to it
    // right after create() resolves (Product Decision "Capture vs
    // Authoring") — must be respected, not overwritten, or the destination
    // Workspace looks up an id that was never stored.
    const id = payload.id ?? `g-demo-${Date.now()}`;
    demoGoalDTOs.push({
      id,
      title: payload.title,
      description: payload.description ?? '',
      category: 'personal',
      priority: 'medium',
      state: 'Draft',
      commitmentIds: [],
      habitIds: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    return { goalId: id };
  },

  rename: async (id: string, title: string): Promise<{ goalId: string; title: string }> => {
    const dto = findOrThrow(id);
    dto.title = title;
    return { goalId: id, title };
  },

  // Goal Draft Editing (follow-up to Decisión B): mirrors the real backend's
  // PATCH /goals/:id/description — the only way a Goal created via Quick
  // Capture (title only) can ever satisfy activate()'s description invariant.
  updateDescription: async (id: string, description: string): Promise<{ goalId: string; description: string | null }> => {
    const dto = findOrThrow(id);
    dto.description = description;
    return { goalId: id, description: dto.description || null };
  },

  // Mirrors Goal.activate()'s domain invariants (packages/domain/src/goal/aggregate/goal.ts)
  // so Demo Mode can't silently diverge from what the real backend enforces.
  activate: async (id: string): Promise<{ goalId: string; state: string }> => {
    const dto = findOrThrow(id);
    if (dto.state === 'Active') {
      return { goalId: id, state: dto.state }; // Idempotent
    }
    if (dto.state !== 'Draft') {
      throw new Error(`Cannot activate goal from state: ${dto.state}`);
    }
    if (!dto.description || dto.description.trim().length === 0) {
      throw new Error('Goal must have a description before it can be activated.');
    }
    if (dto.commitmentIds.length === 0) {
      throw new Error('Goal must have at least one linked Commitment before it can be activated.');
    }
    dto.state = 'Active';
    return { goalId: id, state: dto.state };
  },

  complete: async (id: string): Promise<{ goalId: string; state: string }> => {
    const dto = findOrThrow(id);
    // Decisión B, Goal Lifecycle: Draft can no longer complete directly —
    // it must go through Active first (activate()), same as the real backend.
    if (dto.state === 'Draft') {
      throw new Error(`Cannot complete goal from state: ${dto.state}`);
    }
    dto.state = 'Completed';
    dto.completedAt = new Date().toISOString();
    return { goalId: id, state: dto.state };
  },

  archive: async (id: string): Promise<{ goalId: string; state: string }> => {
    const dto = findOrThrow(id);
    dto.state = 'Archived';
    return { goalId: id, state: dto.state };
  },

  linkCommitment: async (goalId: string, commitmentId: string): Promise<{ goalId: string }> => {
    const dto = findOrThrow(goalId);
    if (!dto.commitmentIds.includes(commitmentId)) {
      dto.commitmentIds = [...dto.commitmentIds, commitmentId];
    }
    return { goalId };
  },

  /** Demo-only — Milestone has no backend equivalent yet (milestone_domain_assessment.md). */
  getMilestonesFor: (goalId: string): Milestone[] => demoMilestones.filter((m) => m.goalId === goalId),

  toggleMilestone: async (id: string): Promise<Milestone> => {
    const milestone = findMilestoneOrThrow(id);
    const updated: Milestone = { ...milestone, completed: !milestone.completed };
    demoMilestones = demoMilestones.map((m) => (m.id === id ? updated : m));
    return updated;
  },
};
