export type CommitmentView = {
  id: string;
  identityId: string;
  title: string;
  description: string | null;
  state: string;
  version: number;
  recurrencePattern: string;
  targetDate?: string;
  seriesId: string;
};

export type PaginatedCommitments = {
  data: CommitmentView[];
  total: number;
};
