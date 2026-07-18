import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGoalHistoryQuery } from '../application/queries/get-goal-history.query';
import { GetGoalHistoryQueryHandlerCore } from '../application/queries/get-goal-history.handler';
import { GoalHistoryEntryDto } from '../api/dtos/goal-history-entry.dto';
import type { EventStore } from '@commitment/domain';

@QueryHandler(GetGoalHistoryQuery)
export class GetGoalHistoryNestjsHandler implements IQueryHandler<
  GetGoalHistoryQuery,
  GoalHistoryEntryDto[]
> {
  private readonly core: GetGoalHistoryQueryHandlerCore;

  constructor(
    @Inject('EventStore')
    eventStore: EventStore,
  ) {
    this.core = new GetGoalHistoryQueryHandlerCore(eventStore);
  }

  public async execute(
    query: GetGoalHistoryQuery,
  ): Promise<GoalHistoryEntryDto[]> {
    return this.core.handle(query);
  }
}
