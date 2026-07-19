// ADR-022 Task Lifecycle & Execution Model — 5 official states. `Archived`
// removed (existing data migrates to `Cancelled`); `Deferred` was proposed
// pre-ADR-022 and never built. See
// docs/03-architecture/adr_022_task_lifecycle_and_execution_model.md §4.1.
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskBlockedType = 'manual' | 'dependency';

export interface TaskModel {
  id: string;
  identityId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutes: number;
  /** Set only via Task.schedule() (Story 3's ScheduleTaskCommand) — no creation-time equivalent, matches the domain. */
  startDate?: string | null;
  dueDate?: string | null;
  tags?: string[];
  metadata?: Record<string, any>;
  commitmentId?: string | null;
  /** Direct Goal link — mutually exclusive with commitmentId (see Task.relinkGoal domain invariant). */
  goalId?: string | null;
  createdAt: string;
  completedAt?: string | null;
  /** Only meaningful when status === 'blocked' (ADR-022 §4.2). */
  blockedType?: TaskBlockedType | null;
  blockedReason?: string | null;
}

export interface DashboardViewModel {
  today: TaskModel[];
  upcoming: TaskModel[];
  recentActivity: TaskModel[];
  metrics: { pending: number; completedThisWeek: number; completionRate: number };
}
