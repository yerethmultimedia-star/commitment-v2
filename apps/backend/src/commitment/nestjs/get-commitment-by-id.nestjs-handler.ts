import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommitmentByIdQuery } from '../application/queries/get-commitment-by-id.query';
import { GetCommitmentByIdQueryHandlerCore } from '../application/queries/get-commitment-by-id.handler';
import { CommitmentView } from '../application/queries/commitment-view.dto';
import type { CommitmentQueryService } from '../application/ports/commitment-query-service.port';

@QueryHandler(GetCommitmentByIdQuery)
export class GetCommitmentByIdNestjsHandler implements IQueryHandler<
  GetCommitmentByIdQuery,
  CommitmentView
> {
  private readonly core: GetCommitmentByIdQueryHandlerCore;

  constructor(
    @Inject('CommitmentQueryService')
    queryService: CommitmentQueryService,
  ) {
    this.core = new GetCommitmentByIdQueryHandlerCore(queryService);
  }

  public async execute(query: GetCommitmentByIdQuery): Promise<CommitmentView> {
    return this.core.handle(query);
  }
}
