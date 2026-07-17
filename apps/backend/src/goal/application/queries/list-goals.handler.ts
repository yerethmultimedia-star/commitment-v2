import { ListGoalsQuery } from './list-goals.query';
import { PaginatedGoals } from './goal-view.dto';
import { GoalQueryService } from '../ports/goal-query-service.port';

export class ListGoalsQueryHandlerCore {
  constructor(private readonly queryService: GoalQueryService) {}

  public async handle(query: ListGoalsQuery): Promise<PaginatedGoals> {
    return this.queryService.list({
      status: query.status,
      search: query.search,
    });
  }
}
