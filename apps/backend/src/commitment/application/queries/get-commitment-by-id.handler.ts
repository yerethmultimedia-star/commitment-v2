import { GetCommitmentByIdQuery } from './get-commitment-by-id.query';
import { CommitmentView } from './commitment-view.dto';
import { CommitmentQueryService } from '../ports/commitment-query-service.port';

export class CommitmentNotFoundQueryError extends Error {
  constructor(id: string) {
    super(`Commitment not found: ${id}`);
    this.name = 'CommitmentNotFoundQueryError';
  }
}

export class GetCommitmentByIdQueryHandlerCore {
  constructor(private readonly queryService: CommitmentQueryService) {}

  public async handle(query: GetCommitmentByIdQuery): Promise<CommitmentView> {
    const commitment = await this.queryService.findById(query.commitmentId);

    if (!commitment) {
      throw new CommitmentNotFoundQueryError(query.commitmentId);
    }

    return commitment;
  }
}
