import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListGoalsQuery } from '../application/queries/list-goals.query';
import { ListGoalsQueryHandlerCore } from '../application/queries/list-goals.handler';
import { PaginatedGoals } from '../application/queries/goal-view.dto';
import type { GoalQueryService } from '../application/ports/goal-query-service.port';

@QueryHandler(ListGoalsQuery)
export class ListGoalsNestjsHandler implements IQueryHandler<
  ListGoalsQuery,
  PaginatedGoals
> {
  private readonly core: ListGoalsQueryHandlerCore;

  constructor(
    @Inject('GoalQueryService')
    queryService: GoalQueryService,
  ) {
    this.core = new ListGoalsQueryHandlerCore(queryService);
  }

  public async execute(query: ListGoalsQuery): Promise<PaginatedGoals> {
    return this.core.handle(query);
  }
}
