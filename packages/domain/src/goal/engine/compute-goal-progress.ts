/**
 * computeGoalProgress
 *
 * Pure computation — a Goal's progress is never a stored/hardcoded
 * number. It's derived from the progress of its linked Commitments
 * (themselves derived from Task completion, computed by the caller) and
 * its Milestones. No I/O, no domain-object coupling — just numbers and
 * booleans in, a single 0..1 ratio out, so any caller (mobile demo
 * adapter today, a real backend query later) can feed it real data
 * without this function changing.
 *
 * Weighting: when both commitments and milestones exist, each
 * contributes half. When only one is present, it alone determines
 * progress. With neither, progress is 0 — not undefined, not NaN.
 */
export interface ComputeGoalProgressInput {
  /** One 0..1 ratio per linked Commitment (already derived from its Tasks). */
  readonly commitmentProgressRatios: readonly number[];
  readonly milestones: readonly { completed: boolean }[];
}

export function computeGoalProgress(input: ComputeGoalProgressInput): number {
  const { commitmentProgressRatios, milestones } = input;

  const hasCommitments = commitmentProgressRatios.length > 0;
  const hasMilestones = milestones.length > 0;

  const commitmentAvg = hasCommitments
    ? commitmentProgressRatios.reduce((sum, r) => sum + r, 0) / commitmentProgressRatios.length
    : 0;
  const milestoneRatio = hasMilestones
    ? milestones.filter((m) => m.completed).length / milestones.length
    : 0;

  if (hasCommitments && hasMilestones) {
    return (commitmentAvg + milestoneRatio) / 2;
  }
  if (hasCommitments) return commitmentAvg;
  if (hasMilestones) return milestoneRatio;
  return 0;
}
