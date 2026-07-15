import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListHabitsQuery } from './list-habits.query';
import { PaginatedHabits, HabitView } from './habit-view.dto';
import { InMemoryHabitProjectionStore } from '../../infrastructure/in-memory-habit-projection.store';

@QueryHandler(ListHabitsQuery)
@Injectable()
export class ListHabitsQueryHandler implements IQueryHandler<ListHabitsQuery> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public execute(query: ListHabitsQuery): Promise<PaginatedHabits> {
    let habits: HabitView[] = this.store.findAll();

    if (query.identityId) {
      habits = habits.filter((h) => h.identityId === query.identityId);
    }
    if (query.state) {
      habits = habits.filter((h) => h.state === query.state);
    }
    if (query.goalId) {
      habits = habits.filter((h) => h.goalId === query.goalId);
    }

    habits.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = habits.length;
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const sliced = habits.slice((page - 1) * limit, page * limit);

    return Promise.resolve({ data: sliced, total, page, limit });
  }
}
