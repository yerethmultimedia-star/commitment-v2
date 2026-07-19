export interface TaskView {
  id: string;
  identityId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedMinutes: number;
  actualMinutes: number;
  startDate?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  commitmentId?: string | null;
  goalId?: string | null;
  blockedType?: string | null;
  blockedReason?: string | null;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
}

export interface PaginatedTasks {
  data: TaskView[];
  total: number;
  page: number;
  limit: number;
}
