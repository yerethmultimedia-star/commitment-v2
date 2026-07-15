export type CommitmentStatus = 'active' | 'draft' | 'paused' | 'completed' | 'cancelled';
export type CommitmentPriority = 'low' | 'medium' | 'high';

export interface CommitmentModel {
  id: string;
  title: string;
  status: CommitmentStatus;
  priority: CommitmentPriority;
  targetDate?: string;
  recurrencePattern?: string;
  /** Owning Goal, when linked. Real backend doesn't have this relationship yet (VS-031 Phase 2). */
  goalId?: string;
}
