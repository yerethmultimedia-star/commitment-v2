import { AIProposal } from '../../ai-proposal/ai-proposal.js';
import { Recommendation } from '../../dashboard/Recommendation.js';
import { AIProposalToRecommendationTransformer } from '../ai-proposal-to-recommendation.js';

describe('AR-050 D-050.1, Incremento 1 — Recommendation <-> AIProposal boundary', () => {
  it('the transformer type is satisfiable: an AIProposal can become a Recommendation only through it', () => {
    const exampleTransformer: AIProposalToRecommendationTransformer = (
      proposal: AIProposal,
    ): Recommendation => ({
      type: 'COACH_TIP',
      targetId: proposal.targetId,
      source: 'ai-platform',
      priority: 0,
      metadata: proposal.metadata,
    });

    const proposal: AIProposal = {
      type: 'SUGGEST_HABIT',
      targetId: 'habit-123',
      rationale: 'evidence-backed suggestion',
      metadata: {},
    };

    const recommendation = exampleTransformer(proposal);

    expect(recommendation.type).toBe('COACH_TIP');
    expect(recommendation.targetId).toBe(proposal.targetId);
    // AIProposal's own shape (type/rationale) never leaks into Recommendation directly —
    // only what the transformer explicitly chooses to carry over does.
    expect('rationale' in recommendation).toBe(false);
  });
});
