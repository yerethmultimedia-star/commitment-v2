import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetHabitByIdQuery } from './get-habit-by-id.query';
import { HabitView } from './habit-view.dto';
import { InMemoryHabitProjectionStore } from '../../infrastructure/in-memory-habit-projection.store';

export class HabitNotFoundQueryError extends Error {
  constructor(id: string) {
    super(`Habit not found: ${id}`);
    this.name = 'HabitNotFoundQueryError';
  }
}

@QueryHandler(GetHabitByIdQuery)
@Injectable()
export class GetHabitByIdQueryHandler implements IQueryHandler<GetHabitByIdQuery> {
  constructor(
    @Inject('HabitProjectionStore')
    private readonly store: InMemoryHabitProjectionStore,
  ) {}

  public execute(query: GetHabitByIdQuery): Promise<HabitView> {
    const view = this.store.findById(query.id);
    if (!view) throw new HabitNotFoundQueryError(query.id);
    return Promise.resolve(view);
  }
}
