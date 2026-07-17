export type GoalView = {
  id: string;
  identityId: string;
  title: string;
  description: string | null;
  state: string;
  version: number;
  commitmentIds: string[];
  habitIds: string[];
  completedAt: string | null;
};

export type PaginatedGoals = {
  data: GoalView[];
  total: number;
};
