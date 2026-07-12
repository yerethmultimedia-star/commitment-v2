import { TaskView } from './task-view.dto';

export interface DashboardViewModel {
  today: TaskView[];
  upcoming: TaskView[];
  recentActivity: TaskView[];
  metrics: {
    pending: number;
    completedThisWeek: number;
    completionRate: number;
  };
}
