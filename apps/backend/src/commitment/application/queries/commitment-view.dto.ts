export type CommitmentView = {
  id: string;
  identityId: string;
  title: string;
  description: string | null;
  state: string;
  version: number;
};

export type PaginatedCommitments = {
  data: CommitmentView[];
  total: number;
};
