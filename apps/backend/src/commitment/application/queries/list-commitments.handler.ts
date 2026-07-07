import { ListCommitmentsQuery } from './list-commitments.query';
import { PaginatedCommitments } from './commitment-view.dto';
import { CommitmentQueryService } from '../ports/commitment-query-service.port';

export class ListCommitmentsQueryHandlerCore {
  constructor(private readonly queryService: CommitmentQueryService) {}

  public async handle(
    query: ListCommitmentsQuery,
  ): Promise<PaginatedCommitments> {
    return this.queryService.list({
      status: query.status,
      search: query.search,
      sortBy: query.sortBy,
    });
  }
}
