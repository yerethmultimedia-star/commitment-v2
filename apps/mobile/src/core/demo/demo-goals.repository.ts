import { computeGoalProgress, Milestone } from '@commitment/domain';
import { computeCommitmentProgressRatio, demoCommitmentDTOs, daysAgo } from './demo-data';

export interface DemoGoalDTO {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'finance' | 'learning' | 'personal';
  priority: 'high' | 'medium' | 'low';
  state: 'Draft' | 'Active' | 'Completed' | 'Archived';
  targetDate?: string;
  commitmentIds: string[];
  habitIds: string[];
  createdAt: string;
  /** ISO, non-null only when state === 'Completed' — mirrors Goal.completedAt on the real aggregate. */
  completedAt: string | null;
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
    targetDate: undefined,
    commitmentIds: ['c-01', 'c-03', 'c-12', 'c-15'],
    habitIds: ['h-01', 'h-05', 'h-07'],
    createdAt: '2026-05-01T00:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'g-02', title: 'Improve Mental Wellbeing', category: 'personal', priority: 'medium', state: 'Active',
    description: 'Make space to slow down — a clearer mind and a clearer home.',
    targetDate: undefined,
    commitmentIds: ['c-09', 'c-10'],
    habitIds: ['h-02'],
    createdAt: '2026-05-05T00:00:00.000Z',
    completedAt: null,
  },
  {
    // Completed in "last week" (per §2b) so Objetivos completados has real week-over-week density.
    id: 'g-03', title: 'Build Financial Freedom', category: 'finance', priority: 'high', state: 'Completed',
    description: 'A real safety net, and a real plan for the next big purchase.',
    targetDate: undefined,
    commitmentIds: ['c-04', 'c-13'],
    habitIds: [],
    createdAt: '2026-04-20T00:00:00.000Z',
    completedAt: daysAgo(10),
  },
  {
    id: 'g-04', title: 'Become More Productive', category: 'career', priority: 'high', state: 'Active',
    description: 'Ship what matters, on a rhythm that does not burn out.',
    targetDate: undefined,
    commitmentIds: ['c-02', 'c-08', 'c-11', 'c-14'],
    habitIds: ['h-04'],
    createdAt: '2026-04-10T00:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'g-05', title: 'Learn Portuguese', category: 'learning', priority: 'low', state: 'Active',
    description: 'Enough conversational Portuguese to get by on the next trip.',
    targetDate: undefined,
    commitmentIds: ['c-06', 'c-16'],
    habitIds: ['h-03', 'h-08'],
    createdAt: '2026-05-12T00:00:00.000Z',
    completedAt: null,
  },
  {
    // Completed "this week" (per §2b) so Objetivos completados has a non-zero current-week count.
    id: 'g-06', title: 'Keep Reading', category: 'learning', priority: 'low', state: 'Completed',
    description: '24 books this year — one good habit, read consistently.',
    targetDate: undefined,
    commitmentIds: ['c-05'],
    habitIds: ['h-06'],
    createdAt: '2026-05-15T00:00:00.000Z',
    completedAt: daysAgo(3),
  },
  {
    id: 'g-07', title: 'Build Better Relationships', category: 'personal', priority: 'medium', state: 'Active',
    description: 'Put real time back into the friendships that matter.',
    targetDate: undefined,
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
  // Same event as Commitment c-01 ("Run a half marathon").
  { id: 'm-03', goalId: 'g-01', title: 'Finish the half marathon', completed: false, targetDate: commitmentTargetDate('c-01') },

  { id: 'm-04', goalId: 'g-02', title: 'Set up a meditation corner', completed: true },
  { id: 'm-05', goalId: 'g-02', title: 'Meditate 7 days in a row', completed: false },
  { id: 'm-06', goalId: 'g-02', title: 'Declutter the bedroom', completed: false },

  { id: 'm-07', goalId: 'g-03', title: 'Save the first $1,000', completed: true },
  { id: 'm-08', goalId: 'g-03', title: 'Fully fund the emergency fund', completed: true },
  { id: 'm-09', goalId: 'g-03', title: 'Reach 50% of the down payment goal', completed: false },

  { id: 'm-10', goalId: 'g-04', title: 'Ship the v2 beta', completed: true },
  { id: 'm-11', goalId: 'g-04', title: 'Complete the onboarding audit', completed: true },
  // Same event as Commitment c-08 ("Ship the mobile redesign").
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

/** Latest target date among a Goal's linked commitments — never a separately invented date. */
function deriveTargetDate(dto: DemoGoalDTO): string | undefined {
  if (dto.targetDate) return dto.targetDate;
  const dates = dto.commitmentIds
    .map((id) => demoCommitmentDTOs.find((c) => c.id === id)?.targetDate)
    .filter((d): d is string => Boolean(d));
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest));
}

async function withProgress(dto: DemoGoalDTO) {
  const commitmentProgressRatios = dto.commitmentIds.map((id) => computeCommitmentProgressRatio(id));
  const milestones = demoMilestones.filter((m) => m.goalId === dto.id);
  const progress = computeGoalProgress({ commitmentProgressRatios, milestones });
  return { ...dto, progress, milestones, targetDate: deriveTargetDate(dto) };
}

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

export const demoGoalsRepository = {
  list: async () => {
    const items = await Promise.all(demoGoalDTOs.map(withProgress));
    return { items, total: items.length };
  },

  getById: async (id: string) => withProgress(findOrThrow(id)),

  create: async (payload: { title: string; description?: string }) => {
    const id = `g-demo-${Date.now()}`;
    demoGoalDTOs.push({
      id,
      title: payload.title,
      description: payload.description ?? '',
      category: 'personal',
      priority: 'medium',
      state: 'Active',
      commitmentIds: [],
      habitIds: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    return { goalId: id };
  },

  toggleMilestone: async (id: string): Promise<Milestone> => {
    const milestone = findMilestoneOrThrow(id);
    const updated: Milestone = { ...milestone, completed: !milestone.completed };
    demoMilestones = demoMilestones.map((m) => (m.id === id ? updated : m));
    return updated;
  },
};
