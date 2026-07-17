export type TaskStatus = 'pending' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskModel {
  id: string;
  identityId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate?: string | null;
  commitmentId?: string | null;
  /** Direct Goal link — mutually exclusive with commitmentId (see Task.relinkGoal domain invariant). */
  goalId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface DashboardViewModel {
  today: TaskModel[];
  upcoming: TaskModel[];
  recentActivity: TaskModel[];
  metrics: { pending: number; completedThisWeek: number; completionRate: number };
}
