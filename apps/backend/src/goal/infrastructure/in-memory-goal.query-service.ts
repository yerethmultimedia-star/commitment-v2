import { Inject, Injectable } from '@nestjs/common';
import {
  GoalQueryService,
  GoalFilters,
} from '../application/ports/goal-query-service.port';
import { GoalView, PaginatedGoals } from '../application/queries/goal-view.dto';
import { InMemoryGoalProjectionStore } from './in-memory-goal-projection.store';

@Injectable()
export class InMemoryGoalQueryService implements GoalQueryService {
  constructor(
    @Inject('GoalProjectionStore')
    private readonly store: InMemoryGoalProjectionStore,
  ) {}

  public findById(id: string): Promise<GoalView | null> {
    const view = this.store.findById(id);
    return Promise.resolve(view);
  }

  public list(filters: GoalFilters): Promise<PaginatedGoals> {
    let results = this.store.findAll();

    if (filters.status) {
      results = results.filter((g) => g.state === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (g) =>
          g.title.toLowerCase().includes(searchLower) ||
          (g.description && g.description.toLowerCase().includes(searchLower)),
      );
    }

    return Promise.resolve({
      data: results,
      total: results.length,
    });
  }
}
