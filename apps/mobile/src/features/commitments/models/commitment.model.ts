export type CommitmentStatus = 'active' | 'draft' | 'paused' | 'completed' | 'cancelled';

export interface CommitmentModel {
  id: string;
  title: string;
  status: CommitmentStatus;
  targetDate?: string;
  recurrencePattern?: string;
}
