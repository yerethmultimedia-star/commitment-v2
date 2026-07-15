import { computeGoalProgress } from '../engine/compute-goal-progress.js';

describe('computeGoalProgress', () => {
  it('returns 0 when there is nothing to derive progress from', () => {
    expect(computeGoalProgress({ commitmentProgressRatios: [], milestones: [] })).toBe(0);
  });

  it('averages commitment ratios when there are no milestones', () => {
    const progress = computeGoalProgress({
      commitmentProgressRatios: [0.5, 1, 0],
      milestones: [],
    });
    expect(progress).toBeCloseTo(0.5);
  });

  it('uses milestone completion ratio when there are no commitments', () => {
    const progress = computeGoalProgress({
      commitmentProgressRatios: [],
      milestones: [{ completed: true }, { completed: true }, { completed: false }, { completed: false }],
    });
    expect(progress).toBeCloseTo(0.5);
  });

  it('weighs commitments and milestones evenly when both exist', () => {
    const progress = computeGoalProgress({
      commitmentProgressRatios: [1, 1], // avg 1.0
      milestones: [{ completed: true }, { completed: false }], // ratio 0.5
    });
    expect(progress).toBeCloseTo(0.75);
  });

  it('never returns NaN or a value outside 0..1', () => {
    const progress = computeGoalProgress({
      commitmentProgressRatios: [0.3, 0.9],
      milestones: [{ completed: true }],
    });
    expect(Number.isNaN(progress)).toBe(false);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });
});
