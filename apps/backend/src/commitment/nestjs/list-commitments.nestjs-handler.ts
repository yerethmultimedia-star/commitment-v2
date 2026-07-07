import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListCommitmentsQuery } from '../application/queries/list-commitments.query';
import { ListCommitmentsQueryHandlerCore } from '../application/queries/list-commitments.handler';
import { PaginatedCommitments } from '../application/queries/commitment-view.dto';
import type { CommitmentQueryService } from '../application/ports/commitment-query-service.port';

@QueryHandler(ListCommitmentsQuery)
export class ListCommitmentsNestjsHandler implements IQueryHandler<
  ListCommitmentsQuery,
  PaginatedCommitments
> {
  private readonly core: ListCommitmentsQueryHandlerCore;

  constructor(
    @Inject('CommitmentQueryService')
    queryService: CommitmentQueryService,
  ) {
    this.core = new ListCommitmentsQueryHandlerCore(queryService);
  }

  public async execute(
    query: ListCommitmentsQuery,
  ): Promise<PaginatedCommitments> {
    return this.core.handle(query);
  }
}
