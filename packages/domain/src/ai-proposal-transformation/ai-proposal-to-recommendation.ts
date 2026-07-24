import { AIProposal } from '../ai-proposal/ai-proposal.js';
import { Recommendation } from '../dashboard/Recommendation.js';

/**
 * AR-050 D-050.1, Incremento 1 — the single, explicit boundary between the AI platform's output
 * (`AIProposal`) and the product's existing recommendation model (`Recommendation`). Lives here,
 * not inside `ai-proposal/` or `dashboard/`, precisely so neither of those modules ever has to
 * import the other — this is the only file allowed to import both. No inheritance, no structural-
 * shape coincidence, no implicit equivalence: a transformer is the only way an `AIProposal` may
 * ever become a `Recommendation`. `AIProposal` can evolve without touching `Recommendation`, and
 * `Recommendation` can evolve without touching the AI platform — only this boundary absorbs
 * either change.
 */
export type AIProposalToRecommendationTransformer = (
  proposal: AIProposal,
) => Recommendation;
