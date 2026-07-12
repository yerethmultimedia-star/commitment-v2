import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTasksQuery } from './list-tasks.query';
import { PaginatedTasks, TaskView } from './task-view.dto';
import { InMemoryTaskProjectionStore } from '../../infrastructure/in-memory-task-projection.store';

@QueryHandler(ListTasksQuery)
@Injectable()
export class ListTasksQueryHandler implements IQueryHandler<ListTasksQuery> {
  constructor(
    @Inject('TaskProjectionStore')
    private readonly store: InMemoryTaskProjectionStore,
  ) {}

  public execute(query: ListTasksQuery): Promise<PaginatedTasks> {
    let tasks: TaskView[] = this.store.findAll();

    // Filter out deleted tasks by default
    tasks = tasks.filter((t) => !t.deletedAt);

    if (query.identityId) {
      tasks = tasks.filter((t) => t.identityId === query.identityId);
    }
    if (query.status) {
      tasks = tasks.filter((t) => t.status === query.status);
    }
    if (query.priority) {
      tasks = tasks.filter((t) => t.priority === query.priority);
    }
    if (query.commitmentId) {
      tasks = tasks.filter((t) => t.commitmentId === query.commitmentId);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (query.dueBefore) {
      const before = new Date(query.dueBefore);
      tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) <= before);
    }
    if (query.dueAfter) {
      const after = new Date(query.dueAfter);
      tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= after);
    }

    // Sorting
    if (query.sort === 'dueDate') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (query.sort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      tasks.sort(
        (a, b) =>
          (order[a.priority as keyof typeof order] ?? 1) -
          (order[b.priority as keyof typeof order] ?? 1),
      );
    } else {
      // Default: newest first
      tasks.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const total = tasks.length;
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const sliced = tasks.slice((page - 1) * limit, page * limit);

    return Promise.resolve({ data: sliced, total, page, limit });
  }
}
