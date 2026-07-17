import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGoalByIdQuery } from '../application/queries/get-goal-by-id.query';
import { GetGoalByIdQueryHandlerCore } from '../application/queries/get-goal-by-id.handler';
import { GoalView } from '../application/queries/goal-view.dto';
import type { GoalQueryService } from '../application/ports/goal-query-service.port';

@QueryHandler(GetGoalByIdQuery)
export class GetGoalByIdNestjsHandler implements IQueryHandler<
  GetGoalByIdQuery,
  GoalView
> {
  private readonly core: GetGoalByIdQueryHandlerCore;

  constructor(
    @Inject('GoalQueryService')
    queryService: GoalQueryService,
  ) {
    this.core = new GetGoalByIdQueryHandlerCore(queryService);
  }

  public async execute(query: GetGoalByIdQuery): Promise<GoalView> {
    return this.core.handle(query);
  }
}
