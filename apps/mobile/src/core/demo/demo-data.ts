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
}

const COMMITMENT_SEEDS: DemoCommitmentSeed[] = [
  { id: 'c-01', title: 'Run a half marathon', state: 'Active', category: 'health', priority: 'medium', targetDate: daysFromNow(45), progressRatio: 0.6, taskCount: 5, goalId: 'g-01' },
  { id: 'c-02', title: 'Launch Commitment v2', state: 'Active', category: 'career', priority: 'medium', targetDate: daysFromNow(20), recurrencePattern: 'weekly', progressRatio: 0.72, taskCount: 6, goalId: 'g-04' },
  { id: 'c-03', title: 'Build a healthy morning routine', state: 'Active', category: 'health', priority: 'high', recurrencePattern: 'daily', progressRatio: 0.48, taskCount: 4, goalId: 'g-01' },
  { id: 'c-04', title: 'Save for a house down payment', state: 'Active', category: 'finance', priority: 'low', targetDate: daysFromNow(300), progressRatio: 0.28, taskCount: 3, goalId: 'g-03' },
  { id: 'c-05', title: 'Read 24 books this year', state: 'Active', category: 'learning', priority: 'low', targetDate: daysFromNow(180), progressRatio: 0.33, taskCount: 4, goalId: 'g-06' },
  { id: 'c-06', title: 'Learn conversational Portuguese', state: 'Active', category: 'learning', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.2, taskCount: 3, goalId: 'g-05' },
  { id: 'c-07', title: 'Reconnect with old friends', state: 'Active', category: 'personal', priority: 'low', progressRatio: 0.5, taskCount: 2, goalId: 'g-07' },
  { id: 'c-08', title: 'Ship the mobile redesign', state: 'Active', category: 'career', priority: 'high', targetDate: daysFromNow(10), progressRatio: 0.85, taskCount: 4, goalId: 'g-04' },
  { id: 'c-09', title: 'Meditate consistently', state: 'Paused', category: 'health', priority: 'medium', recurrencePattern: 'daily', progressRatio: 0.4, taskCount: 2, goalId: 'g-02' },
  { id: 'c-10', title: 'Declutter the apartment', state: 'Paused', category: 'personal', priority: 'low', progressRatio: 0.15, taskCount: 2, goalId: 'g-02' },
  { id: 'c-11', title: 'Finish the onboarding audit', state: 'Completed', category: 'career', priority: 'medium', targetDate: daysAgo(5), progressRatio: 1, taskCount: 3, goalId: 'g-04' },
  { id: 'c-12', title: 'Complete a 30-day fitness challenge', state: 'Completed', category: 'health', priority: 'high', targetDate: daysAgo(12), progressRatio: 1, taskCount: 3, goalId: 'g-01' },
  { id: 'c-13', title: 'Set up the emergency fund', state: 'Completed', category: 'finance', priority: 'medium', targetDate: daysAgo(30), progressRatio: 1, taskCount: 2, goalId: 'g-03' },
  { id: 'c-14', title: 'Redesign the personal website', state: 'Draft', category: 'career', priority: 'low', progressRatio: 0, taskCount: 0, goalId: 'g-04' },
  { id: 'c-15', title: 'Train for a triathlon', state: 'Cancelled', category: 'health', priority: 'low', progressRatio: 0.1, taskCount: 1, goalId: 'g-01' },
  { id: 'c-16', title: 'Watch Portuguese shows with subtitles', state: 'Active', category: 'learning', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.33, taskCount: 3, goalId: 'g-05' },
  { id: 'c-17', title: 'Send a thoughtful message weekly', state: 'Active', category: 'personal', priority: 'medium', recurrencePattern: 'weekly', progressRatio: 0.5, taskCount: 2, goalId: 'g-07' },
];

export interface DemoCommitmentDTO {
  id: string;
  title: string;
  state: DemoCommitmentSeed['state'];
  priority: DemoCommitmentSeed['priority'];
  targetDate?: string;
  recurrencePattern?: string;
  /** Owning Goal. Every seeded commitment has one; a commitment created outside the Goal Workspace may not. */
  goalId?: string;
}

export const demoCommitmentDTOs: DemoCommitmentDTO[] = COMMITMENT_SEEDS.map((c) => ({
  id: c.id,
  title: c.title,
  state: c.state,
  priority: c.priority,
  targetDate: c.targetDate,
  recurrencePattern: c.recurrencePattern,
  goalId: c.goalId,
}));

/** commitmentId -> goalId, for reverse lookups (Task -> Commitment -> Goal). */
export const commitmentGoalId = new Map(COMMITMENT_SEEDS.map((c) => [c.id, c.goalId]));

// --- Tasks -------------------------------------------------------------

const TASK_TITLES_BY_CATEGORY: Record<DemoCommitmentSeed['category'], string[]> = {
  health: ['Morning run', 'Stretch routine', 'Meal prep for the week', 'Track macros', 'Sleep by 10:30pm', 'Hydration check-in'],
  career: ['Review pull requests', 'Write sprint update', 'Sync with design', 'Ship the release notes', 'Prep demo script', 'Audit onboarding flow'],
  finance: ['Review monthly budget', 'Automate the savings transfer', 'Compare mortgage rates', 'Cancel unused subscriptions'],
  learning: ['Read for 30 minutes', 'Finish chapter 4', 'Practice Portuguese flashcards', 'Watch course module', 'Take notes on today\'s reading'],
  personal: ['Call a friend', 'Plan the weekend', 'Write in journal', 'Organize the closet'],
};

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
  const titles = TASK_TITLES_BY_CATEGORY[seed.category];
  const completedCount = Math.round(seed.taskCount * seed.progressRatio);
  const tasks: TaskModel[] = [];

  for (let i = 0; i < seed.taskCount; i++) {
    const isCompleted = i < completedCount;
    const title = titles[i % titles.length];
    const priority = PRIORITY_CYCLE[i % PRIORITY_CYCLE.length];
    // Spread due dates: completed ones across the last 14 days (real
    // week-over-week deltas need density in both weeks, not just this one),
    // pending ones fanned across today/this week/slightly overdue.
    const dueOffset = isCompleted ? nextCompletedTaskOffset() : i - Math.floor(seed.taskCount / 2);

    tasks.push({
      id: nextTaskId(),
      identityId: DEMO_IDENTITY_ID,
      title: `${title} — ${seed.title}`,
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
const GENERAL_TASKS: Array<{ title: string; priority: TaskPriority; dueOffset: number; status: TaskModel['status'] }> = [
  { title: 'Reply to unanswered emails', priority: 'medium', dueOffset: 0, status: 'pending' },
  { title: 'Book the dentist appointment', priority: 'low', dueOffset: 1, status: 'pending' },
  { title: 'Pay the internet bill', priority: 'high', dueOffset: -1, status: 'pending' },
  { title: 'Pick up dry cleaning', priority: 'low', dueOffset: 2, status: 'pending' },
  { title: 'Renew the passport', priority: 'medium', dueOffset: 14, status: 'pending' },
  { title: 'Water the plants', priority: 'low', dueOffset: -2, status: 'completed' },
  { title: 'Back up the laptop', priority: 'medium', dueOffset: -10, status: 'completed' },
  { title: 'Schedule the car service', priority: 'medium', dueOffset: 5, status: 'pending' },
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
    createdAt: daysAgo(Math.abs(g.dueOffset) + 2),
    completedAt: g.status === 'completed' ? daysFromNow(g.dueOffset) : null,
  }));
}

function buildDemoTasks(): TaskModel[] {
  taskCounter = 0;
  const linked = COMMITMENT_SEEDS.filter((c) => c.taskCount > 0).flatMap(buildTasksForCommitment);
  return [...linked, ...buildGeneralTasks()];
}

export const demoTasks: TaskModel[] = buildDemoTasks();

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
