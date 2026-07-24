import { AIPlatform } from '../../ai-proposal/ai-platform.js';
import { AIProposal } from '../../ai-proposal/ai-proposal.js';
import { DashboardContext } from '../../dashboard/DashboardContext.js';
import { Recommendation } from '../../dashboard/Recommendation.js';
import { consumeAIPlatform } from '../consume-ai-platform.js';

/**
 * "Coach" for this test is just `DashboardContext` — the real, already-existing domain data — used
 * as a concrete `AIContext`. No new type is invented to demonstrate the first consumer.
 */
type CoachContext = DashboardContext;

const coachContext: CoachContext = {
  userId: 'user-1',
  commitments: { totalActive: 2, totalCompleted: 5 },
  tasks: { pendingToday: 1, completedThisWeek: 4, upcomingCount: 3 },
  streak: { currentStreakDays: 3, longestStreakDays: 10 },
  habits: { scheduledTodayCount: 2, completedTodayCount: 1, atRiskCount: 0 },
  priorityTask: null,
  snapshotAt: '2026-07-23T00:00:00.000Z',
};

describe('AR-050 D-050.1, Incremento 4 — first consumer (Coach)', () => {
  it('Coach depends only on AIPlatform and never sees an AIProposal directly — it only ever receives Recommendations back', async () => {
    class FakeCoachPlatform implements AIPlatform<CoachContext> {
      public async propose(context: CoachContext): Promise<readonly AIProposal[]> {
        return [
          {
            type: 'SUGGEST_HABIT',
            targetId: context.userId,
            rationale: 'streak is healthy, suggest a new habit',
            metadata: {},
          },
        ];
      }
    }

    const transform = (proposal: AIProposal): Recommendation => ({
      type: 'COACH_SUGGESTED_HABIT',
      targetId: proposal.targetId,
      source: 'ai-platform',
      priority: 1,
      metadata: proposal.metadata,
    });

    const recommendations = await consumeAIPlatform(
      new FakeCoachPlatform(),
      coachContext,
      transform,
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.type).toBe('COACH_SUGGESTED_HABIT');
    expect(recommendations[0]?.targetId).toBe(coachContext.userId);
  });

  it('the transformer runs exactly once per proposal, never zero, never more', async () => {
    class MultiProposalPlatform implements AIPlatform<CoachContext> {
      public async propose(): Promise<readonly AIProposal[]> {
        return [
          { type: 'A', targetId: '1', rationale: 'r1', metadata: {} },
          { type: 'B', targetId: '2', rationale: 'r2', metadata: {} },
        ];
      }
    }

    let callCount = 0;
    const transform = (proposal: AIProposal): Recommendation => {
      callCount += 1;
      return {
        type: 'COACH_TIP',
        targetId: proposal.targetId,
        source: 'ai-platform',
        priority: 0,
        metadata: {},
      };
    };

    const recommendations = await consumeAIPlatform(
      new MultiProposalPlatform(),
      coachContext,
      transform,
    );

    expect(callCount).toBe(2);
    expect(recommendations).toHaveLength(2);
  });

  it('the platform stays reusable by a second, differently-shaped consumer — nothing Coach-specific leaked into consumeAIPlatform', async () => {
    interface JournalContext {
      readonly entryCount: number;
    }

    class JournalPlatform implements AIPlatform<JournalContext> {
      public async propose(
        context: JournalContext,
      ): Promise<readonly AIProposal[]> {
        return context.entryCount > 0
          ? [{ type: 'COACH_TIP', targetId: 'journal', rationale: 'r', metadata: {} }]
          : [];
      }
    }

    const transform = (proposal: AIProposal): Recommendation => ({
      type: 'COACH_TIP',
      targetId: proposal.targetId,
      source: 'ai-platform',
      priority: 0,
      metadata: {},
    });

    const recommendations = await consumeAIPlatform(
      new JournalPlatform(),
      { entryCount: 1 },
      transform,
    );

    expect(recommendations).toHaveLength(1);
  });
});
