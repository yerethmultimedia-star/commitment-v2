import { GoalView, PaginatedGoals } from '../queries/goal-view.dto';

export type GoalFilters = {
  status?: string;
  search?: string;
};

export interface GoalQueryService {
  findById(id: string): Promise<GoalView | null>;
  list(filters: GoalFilters): Promise<PaginatedGoals>;
}
