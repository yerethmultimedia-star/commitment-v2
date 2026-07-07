import {
  CommitmentView,
  PaginatedCommitments,
} from '../queries/commitment-view.dto';

export type CommitmentFilters = {
  status?: string;
  search?: string;
  sortBy?: string;
};

export interface CommitmentQueryService {
  findById(id: string): Promise<CommitmentView | null>;
  list(filters: CommitmentFilters): Promise<PaginatedCommitments>;
}
