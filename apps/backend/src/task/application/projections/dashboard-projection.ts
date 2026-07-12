import { TaskView } from '../queries/task-view.dto';

export interface DashboardProjection {
  identityId: string;
  today: TaskView[];
  upcoming: TaskView[];
  recentActivity: TaskView[];
  metrics: {
    pending: number;
    completedThisWeek: number;
    completionRate: number;
  };
  updatedAt: string;
}
