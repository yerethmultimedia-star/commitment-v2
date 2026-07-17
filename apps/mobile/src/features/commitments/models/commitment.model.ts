export type CommitmentStatus = 'active' | 'draft' | 'paused' | 'completed' | 'cancelled';
export type CommitmentPriority = 'low' | 'medium' | 'high';

export interface CommitmentModel {
  id: string;
  title: string;
  description?: string;
  status: CommitmentStatus;
  priority: CommitmentPriority;
  targetDate?: string;
  recurrencePattern?: string;
  /**
   * Owning Goal, when linked. The domain's own source of truth for this
   * relationship is Goal-owned (`Goal.commitmentIds`/`linkCommitment()`) —
   * `Commitment.register()` itself has no `goalId` parameter at all. This
   * field is a mobile-only adaptation of that relationship, read in the
   * opposite direction, so the UI can filter "which Commitments belong to
   * this Goal" without loading every Goal to check its `commitmentIds`.
   * Since ADR-019 Fase 2A (2026-07-17), the mobile app actively *writes*
   * through this adapted field too (creation, `relinkGoal`), not just reads
   * it — worth knowing if this ever needs reconciling against the real
   * domain direction. Real backend doesn't have either direction of this
   * relationship yet (VS-031 Phase 2, TECH_DEBT Item 31) — demo-mode only,
   * intentionally, until the backend grows a real projection for it.
   */
  goalId?: string;
}
