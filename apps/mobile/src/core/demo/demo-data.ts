import { TaskModel, TaskPriority, DashboardViewModel } from '@/features/tasks/models/task.model';

/**
 * Demo Data — a small, deliberately consistent universe, not random filler.
 *
 * Every commitment's declared progress is backed by an actual ratio of
 * completed-to-total linked tasks (see buildDemoTasks), so a commitment that
 * "looks" 80% done really does have 80% of its tasks completed — no
 * Math.random(), no numbers invented independently of each other.
 *
 * UI-facing labels stay on i18nKey per ADR-014; the demo content itself
 * (goal titles, task names) is illustrative sample content, not interface
 * copy, so it's written directly rather than routed through translation
 * keys — same treatment the project already gives seed/fixture data.
 */

const DAY = 24 * 60 * 60 * 1000;
// Normalized to midnight — these are day-granularity due dates (no seed
// task/commitment has a real due TIME), not wall-clock timestamps. Without
// this, every seed date carries whatever time-of-day the Metro bundle
// happened to load at, so every "due today" item shows the same
// coincidental time on Calendar instead of reading as all-day.
const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const daysFromNow = (n: number) => new Date(today().getTime() + n * DAY).toISOString();
export const daysAgo = (n: number) => daysFromNow(-n);

export const DEMO_IDENTITY_ID = 'demo-user-0001';

export const demoUser = {
  identityId: DEMO_IDENTITY_ID,
  name: 'Jordan Rivera',
  email: 'jordan.rivera@commitment.app',
  avatarInitials: 'JR',
  timezone: 'America/Costa_Rica',
  language: 'en',
  plan: 'Pro' as const,
  memberSince: '2024-01-08T00:00:00.000Z',
  // No real billing system exists — this is illustrative demo content only,
  // same treatment as the rest of this file's seed data (see file header).
  planRenewalDate: daysFromNow(45),
};

interface DemoCommitmentSeed {
  id: string;
  title: string;
  state: 'Active' | 'Draft' | 'Paused' | 'Completed' | 'Cancelled';
  category: 'health' | 'career' | 'finance' | 'learning' | 'personal';
  /** Drives the "Tareas" tab priority badge and, for the active commitment
   * ranked highest, which one Today's priority hero surfaces a task from. */
  priority: 'low' | 'medium' | 'high';
  targetDate?: string;
  recurrencePattern?: string;
  /** Target ratio of completed tasks, drives buildDemoTasks — not shown directly. */
  progressRatio: number;
  taskCount: number;
  /** Owning Goal — see demo-goals.repository.ts. Every commitment belongs to exactly one Goal in the canonical dataset. */
  goalId: string;
  /**
   * Bespoke titles for this Commitment's own Tasks — exactly `taskCount`
   * entries. Replaced the old shared TASK_TITLES_BY_CATEGORY + " — {title}"
   * suffix mechanism (2026-07-17): that produced generic, category-wide
   * filler ("Morning run — Run a half marathon") reused across every
   * Commitment in a category, which is exactly what made Commitment and
   * Task read as the same kind of thing at a glance. Every title here is a
   * concrete, finite, one-off step that concretely supports its parent
   * Commitment — never a restatement of the Commitment itself.
   */
  taskTitles: string[];
}

// Titles below were rewritten 2026-07-17 to honor Goal -> Commitment -> Task
// as three genuinely different scales, not three names for the same thing
// (see TECH_DEBT.md for the finding this responds to). A Commitment reads
// as an ongoing effort or ongoing behavior in support of its Goal — several
// gained recurring language even where recurrencePattern stays 'None',
// since "ongoing" doesn't require a formal recurrence rule to read that way.
// A Task under it is a concrete, finite, one-off action — never a
// restatement of the Commitment. Goal titles are unchanged; they were
// already correctly Goal-scaled.
const COMMITMENT_SEEDS: DemoCommitmentSeed[] = [
  { id: 'c-01', title: 'Train for the half marathon', state: 'Active', category: 'health', priority: 'medium', targetDate: daysFromNow(45), progressRatio: 0.6, taskCount: 5, goalId: 'g-01',
    taskTitles: ['Buy new running shoes', 'Register for the race', 'Book a physiotherapy check-up', 'Map out the training route', 'Replace the water bottle'] },
  { id: 'c-02', title: 'Ship a product update every week', state: 'Active', category: 'career', priority: 'medium', targetDate: daysFromNow(20), recurrencePattern: 'weekly', progressRatio: 0.72, taskCount: 6, goalId: 'g-04',
    taskTitles: ['Review the bug backlog', 'Write the release notes', 'Prep the team demo', 'Sync with design', 'Update the roadmap', 'Record the feature walkthrough'] },
  { id: 'c-03', title: 'Follow a daily morning routine', state: 'Active', category: 'health', priority: 'high', recurrencePattern: 'daily', progressRatio: 0.48, taskCount: 4, goalId: 'g-01',
    taskTitles: ['Lay out workout clothes the night before', 'Buy a sunrise alarm clock', 'Set a recurring morning reminder', 'Look up a beginner stretching routine'] },
  { id: 'c-04', title: 'Save part of every paycheck', state: 'Active', category: 'finance', priority: 'low', targetDate: daysFromNow(300), progressRatio: 0.28, taskCount: 3, goalId: 'g-03',
    taskTitles: ['Open a dedicated savings account', 'Compare mortgage rates', 'Automate the monthly transfer'] },
  { id: 'c-05', title: 'Read a little every day', state: 'Active', category: 'learning', priority: 'low', targetDate: daysFromNow(180), progressRatio: 0.33, taskCount: 4, goalId: 'g-06',
    taskTitles: ['Join a book club', 'Build a to-read list', 'Buy a reading lamp', 'Set a reading goal in the app'] },
  { id: 'c-06', title: 'Practice Portuguese every week', state: 'Active', category: 'learning', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.2, taskCount: 3, goalId: 'g-05',
    taskTitles: ['Buy a grammar book', 'Find a language exchange partner', 'Subscribe to a vocabulary app'] },
  { id: 'c-07', title: 'Reach out to a friend every month', state: 'Active', category: 'personal', priority: 'low', progressRatio: 0.5, taskCount: 2, goalId: 'g-07',
    taskTitles: ['List friends to reconnect with', 'Plan a group video call'] },
  { id: 'c-08', title: 'Push the mobile redesign forward', state: 'Active', category: 'career', priority: 'high', targetDate: daysFromNow(10), progressRatio: 0.85, taskCount: 4, goalId: 'g-04',
    taskTitles: ['Review the new design system', 'Test the app on different devices', 'Collect feedback from the beta group', 'Prepare the launch announcement'] },
  { id: 'c-09', title: 'Meditate every morning', state: 'Paused', category: 'health', priority: 'medium', recurrencePattern: 'daily', progressRatio: 0.4, taskCount: 2, goalId: 'g-02',
    taskTitles: ['Download a meditation app', 'Set up a quiet corner at home'] },
  { id: 'c-10', title: 'Declutter a little every week', state: 'Paused', category: 'personal', priority: 'low', progressRatio: 0.15, taskCount: 2, goalId: 'g-02',
    taskTitles: ['Buy storage boxes', 'Donate clothes I no longer wear'] },
  { id: 'c-11', title: 'Complete the onboarding audit', state: 'Completed', category: 'career', priority: 'medium', targetDate: daysAgo(5), progressRatio: 1, taskCount: 3, goalId: 'g-04',
    taskTitles: ['Record new-user sessions', 'Document friction points', 'Present findings to the team'] },
  { id: 'c-12', title: 'Follow the 30-day fitness challenge', state: 'Completed', category: 'health', priority: 'high', targetDate: daysAgo(12), progressRatio: 1, taskCount: 3, goalId: 'g-01',
    taskTitles: ['Buy workout clothes', 'Download the challenge app', 'Prep healthy snacks for the week'] },
  { id: 'c-13', title: 'Build the emergency fund', state: 'Completed', category: 'finance', priority: 'medium', targetDate: daysAgo(30), progressRatio: 1, taskCount: 2, goalId: 'g-03',
    taskTitles: ['Research high-yield savings accounts', 'Set up an automatic monthly transfer'] },
  { id: 'c-14', title: 'Redesign my personal website', state: 'Draft', category: 'career', priority: 'low', progressRatio: 0, taskCount: 0, goalId: 'g-04', taskTitles: [] },
  { id: 'c-15', title: 'Train weekly for a triathlon', state: 'Cancelled', category: 'health', priority: 'low', progressRatio: 0.1, taskCount: 1, goalId: 'g-01',
    taskTitles: ['Buy a wetsuit'] },
  { id: 'c-16', title: 'Watch Portuguese shows every week', state: 'Active', category: 'learning', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.33, taskCount: 3, goalId: 'g-05',
    taskTitles: ['Find recommended Portuguese shows', 'Create a watch list', 'Jot down new words while watching'] },
  { id: 'c-17', title: 'Send a thoughtful message every week', state: 'Active', category: 'personal', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.5, taskCount: 2, goalId: 'g-07',
    taskTitles: ["Note down friends' and family's important dates", 'Draft a few messages to send'] },
];

export interface DemoCommitmentDTO {
  id: string;
  title: string;
  description?: string;
  state: DemoCommitmentSeed['state'];
  priority: DemoCommitmentSeed['priority'];
  targetDate?: string;
  recurrencePattern?: string;
  /** Owning Goal. Every seeded commitment has one; a commitment created outside the Goal Workspace may not. */
  goalId?: string;
}

// `let`, not `const` — demoCommitmentsRepository must be able to swap in a
// new array reference on every mutation, same reasoning as demoTasks above
// (see replaceDemoTasks): mutating in place would keep React Query's
// referential-equality change detection from ever noticing a create.
export let demoCommitmentDTOs: DemoCommitmentDTO[] = COMMITMENT_SEEDS.map((c) => ({
  id: c.id,
  title: c.title,
  state: c.state,
  priority: c.priority,
  targetDate: c.targetDate,
  recurrencePattern: c.recurrencePattern,
  goalId: c.goalId,
}));

/** The only way demoCommitmentsRepository may update the commitment list — always a new array reference, never an in-place mutation. */
export function replaceDemoCommitmentDTOs(next: DemoCommitmentDTO[]): void {
  demoCommitmentDTOs = next;
}

/** commitmentId -> goalId, for reverse lookups (Task -> Commitment -> Goal). */
export const commitmentGoalId = new Map(COMMITMENT_SEEDS.map((c) => [c.id, c.goalId]));

// --- Tasks -------------------------------------------------------------

const PRIORITY_CYCLE: TaskPriority[] = ['high', 'medium', 'medium', 'low'];
// Duration derives from priority rather than being independently random —
// higher-priority tasks read as bigger chunks of work, consistent with
// PRIORITY_CYCLE rather than a second, unrelated axis of variation.
const ESTIMATED_MINUTES_BY_PRIORITY: Record<TaskPriority, number> = { high: 60, medium: 30, low: 15 };

let taskCounter = 0;
function nextTaskId() {
  taskCounter += 1;
  return `t-${String(taskCounter).padStart(3, '0')}`;
}

// Spreads completed-task history across a real 14-day window (2 calendar
// weeks) instead of clustering everything in the last few days. Cycled by a
// counter shared across ALL commitments (not each commitment's own loop
// index) — a per-commitment index would only ever reach 0-5 (max taskCount),
// which never touches the "last week" entries below, defeating the point.
const RECENT_COMPLETION_OFFSETS = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 8];
let completedTaskCycle = 0;
function nextCompletedTaskOffset(): number {
  const offset = RECENT_COMPLETION_OFFSETS[completedTaskCycle % RECENT_COMPLETION_OFFSETS.length];
  completedTaskCycle += 1;
  return -offset;
}

function buildTasksForCommitment(seed: DemoCommitmentSeed): TaskModel[] {
  const completedCount = Math.round(seed.taskCount * seed.progressRatio);
  const tasks: TaskModel[] = [];

  for (let i = 0; i < seed.taskCount; i++) {
    const isCompleted = i < completedCount;
    const title = seed.taskTitles[i];
    const priority = PRIORITY_CYCLE[i % PRIORITY_CYCLE.length];
    // Spread due dates: completed ones across the last 14 days (real
    // week-over-week deltas need density in both weeks, not just this one),
    // pending ones fanned across today/this week/slightly overdue.
    const dueOffset = isCompleted ? nextCompletedTaskOffset() : i - Math.floor(seed.taskCount / 2);

    tasks.push({
      id: nextTaskId(),
      identityId: DEMO_IDENTITY_ID,
      title,
      description: '',
      status: isCompleted ? 'completed' : 'pending',
      priority,
      estimatedMinutes: ESTIMATED_MINUTES_BY_PRIORITY[priority],
      // actualMinutes is a priority-based estimate proxy (60/30/15 by
      // priority), not measured elapsed time — good enough for a
      // directional "focus minutes" stat, not literal stopwatch data.
      actualMinutes: isCompleted ? ESTIMATED_MINUTES_BY_PRIORITY[priority] : 0,
      dueDate: daysFromNow(dueOffset),
      commitmentId: seed.id,
      createdAt: daysAgo(Math.abs(dueOffset) + seed.taskCount - i + 3),
      completedAt: isCompleted ? daysFromNow(dueOffset) : null,
    });
  }
  return tasks;
}

// A handful of standalone tasks not tied to any commitment — general to-dos.
// `goalId` is set on exactly one (Goal-direct, no Commitment in between) so
// the priority-of-the-day scoring algorithm (useDashboardContext.ts) has a
// real, visually-verifiable case of a non-commitment task winning Today's
// hero — see engineering/governance's Fase 2 design doc §"Demo Dataset".
const GENERAL_TASKS: Array<{ title: string; priority: TaskPriority; dueOffset: number; status: TaskModel['status']; goalId?: string }> = [
  { title: 'Reply to unanswered emails', priority: 'medium', dueOffset: 0, status: 'pending' },
  { title: 'Book the dentist appointment', priority: 'low', dueOffset: 1, status: 'pending' },
  { title: 'Pay the internet bill', priority: 'high', dueOffset: -1, status: 'pending' },
  { title: 'Pick up dry cleaning', priority: 'low', dueOffset: 2, status: 'pending' },
  { title: 'Renew the passport', priority: 'medium', dueOffset: 14, status: 'pending' },
  { title: 'Water the plants', priority: 'low', dueOffset: -2, status: 'completed' },
  { title: 'Back up the laptop', priority: 'medium', dueOffset: -10, status: 'completed' },
  { title: 'Schedule the car service', priority: 'medium', dueOffset: 5, status: 'pending' },
  // Goal-direct (no Commitment): high priority + Active high-priority Goal
  // outscores every commitment-linked task due today in the current seed —
  // deliberately makes this the one that wins the Hero, not a coincidence.
  { title: 'Book the physical therapy assessment', priority: 'high', dueOffset: 0, status: 'pending', goalId: 'g-01' },
];

function buildGeneralTasks(): TaskModel[] {
  return GENERAL_TASKS.map((g) => ({
    id: nextTaskId(),
    identityId: DEMO_IDENTITY_ID,
    title: g.title,
    description: '',
    status: g.status,
    priority: g.priority,
    estimatedMinutes: ESTIMATED_MINUTES_BY_PRIORITY[g.priority],
    actualMinutes: g.status === 'completed' ? ESTIMATED_MINUTES_BY_PRIORITY[g.priority] : 0,
    dueDate: daysFromNow(g.dueOffset),
    commitmentId: null,
    goalId: g.goalId ?? null,
    createdAt: daysAgo(Math.abs(g.dueOffset) + 2),
    completedAt: g.status === 'completed' ? daysFromNow(g.dueOffset) : null,
  }));
}

function buildDemoTasks(): TaskModel[] {
  taskCounter = 0;
  const linked = COMMITMENT_SEEDS.filter((c) => c.taskCount > 0).flatMap(buildTasksForCommitment);
  return [...linked, ...buildGeneralTasks()];
}

// `let`, not `const` — demoTasksRepository must be able to swap in a new
// array reference on every mutation (see replaceDemoTasks below). Mutating
// this array in place (push/unshift/property writes) would keep the same
// reference forever, which silently breaks React Query's + useMemo's
// referential-equality change detection: a refetch() would "succeed" but
// every memoized selector reading this array would keep returning its
// stale cached result until some unrelated dependency happened to change
// too. Found live 2026-07-15 (VS-032 Fase 2 Tasks functional audit) —
// demoHabitDTOs already avoided this by reassigning via .map() in its own
// replace() helper; demoTasks did not.
export let demoTasks: TaskModel[] = buildDemoTasks();

/** The only way demoTasksRepository may update the task list — always a new array reference, never an in-place mutation. */
export function replaceDemoTasks(next: TaskModel[]): void {
  demoTasks = next;
}

/**
 * A Commitment's progress, derived from its own Tasks — never a stored
 * number. This is the same ratio COMMITMENT_SEEDS.progressRatio targets
 * (buildTasksForCommitment completes exactly this fraction of a
 * commitment's tasks), computed here independently so a Goal's progress
 * (computeGoalProgress) is derived from real task state, not from
 * re-reading the seed's own target.
 */
export function computeCommitmentProgressRatio(commitmentId: string): number {
  const tasks = demoTasks.filter((t) => t.commitmentId === commitmentId);
  if (tasks.length === 0) return 0;
  return tasks.filter((t) => t.status === 'completed').length / tasks.length;
}

// --- Derived views (mirrors what the real backend computes) ------------

function isSameDay(iso: string | null | undefined, ref: Date): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return d.toDateString() === ref.toDateString();
}

export function getDemoDashboard(): DashboardViewModel {
  const now = today();
  const pending = demoTasks.filter((t) => t.status === 'pending');
  const todayTasks = pending.filter((t) => isSameDay(t.dueDate, now));
  const upcoming = pending
    .filter((t) => t.dueDate && new Date(t.dueDate) > now && !isSameDay(t.dueDate, now))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const recentActivity = demoTasks
    .filter((t) => t.status === 'completed' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 8);

  const completedThisWeek = demoTasks.filter(
    (t) => t.status === 'completed' && t.completedAt && new Date(t.completedAt).getTime() > now.getTime() - 7 * DAY
  ).length;
  const totalRelevant = demoTasks.filter((t) => t.status !== 'archived').length;
  const completedTotal = demoTasks.filter((t) => t.status === 'completed').length;

  return {
    today: todayTasks,
    upcoming,
    recentActivity,
    metrics: {
      pending: pending.length,
      completedThisWeek,
      completionRate: totalRelevant > 0 ? Math.round((completedTotal / totalRelevant) * 100) : 0,
    },
  };
}
