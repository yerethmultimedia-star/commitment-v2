import { GetGoalByIdQuery } from './get-goal-by-id.query';
import { GoalView } from './goal-view.dto';
import { GoalQueryService } from '../ports/goal-query-service.port';

export class GoalNotFoundQueryError extends Error {
  constructor(id: string) {
    super(`Goal not found: ${id}`);
    this.name = 'GoalNotFoundQueryError';
  }
}

export class GetGoalByIdQueryHandlerCore {
  constructor(private readonly queryService: GoalQueryService) {}

  public async handle(query: GetGoalByIdQuery): Promise<GoalView> {
    const goal = await this.queryService.findById(query.goalId);

    if (!goal) {
      throw new GoalNotFoundQueryError(query.goalId);
    }

    return goal;
  }
}
