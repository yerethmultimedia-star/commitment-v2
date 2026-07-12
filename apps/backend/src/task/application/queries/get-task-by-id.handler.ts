import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskByIdQuery } from './get-task-by-id.query';
import { TaskView } from './task-view.dto';
import { InMemoryTaskProjectionStore } from '../../infrastructure/in-memory-task-projection.store';

export class TaskNotFoundQueryError extends Error {
  constructor(id: string) {
    super(`Task not found: ${id}`);
    this.name = 'TaskNotFoundQueryError';
  }
}

@QueryHandler(GetTaskByIdQuery)
@Injectable()
export class GetTaskByIdQueryHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public execute(query: GetTaskByIdQuery): Promise<TaskView> {
    const view = this.store.findById(query.id);
    if (!view) throw new TaskNotFoundQueryError(query.id);
    return Promise.resolve(view);
  }
}
