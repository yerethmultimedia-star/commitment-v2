import {
  CommitmentQueryService,
  CommitmentFilters,
} from '../application/ports/commitment-query-service.port';
import {
  CommitmentView,
  PaginatedCommitments,
} from '../application/queries/commitment-view.dto';
import { InMemoryCommitmentProjectionStore } from './in-memory-commitment-projection.store';

export class InMemoryCommitmentQueryService implements CommitmentQueryService {
  constructor(private readonly store: InMemoryCommitmentProjectionStore) {}

  public findById(id: string): Promise<CommitmentView | null> {
    const view = this.store.findById(id);
    return Promise.resolve(view);
  }

  public list(filters: CommitmentFilters): Promise<PaginatedCommitments> {
    let results = this.store.findAll();

    if (filters.status) {
      results = results.filter((c) => c.state === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          (c.description && c.description.toLowerCase().includes(searchLower)),
      );
    }

    // Since we don't have createdAt in the current projection,
    // we'll just return them as is for now. In a real DB we'd sort by date.
    // We could add `createdAt` to `CommitmentView` if the events provided it.

    return Promise.resolve({
      data: results,
      total: results.length,
    });
  }
}
