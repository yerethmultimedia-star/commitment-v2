import { AIContext } from '../ai-proposal/ai-context.js';
import { AIPlatform } from '../ai-proposal/ai-platform.js';
import { Recommendation } from '../dashboard/Recommendation.js';
import { AIProposalToRecommendationTransformer } from './ai-proposal-to-recommendation.js';

/**
 * AR-050 D-050.1, Incremento 4 — the one place a consumer (Coach today, others in the future) is
 * allowed to touch both the AI platform and the product's `Recommendation` model. Fixes the
 * dependency direction once: Consumer -> `AIPlatform` -> `AIProposal[]` -> Transformation ->
 * `Recommendation[]`, never the reverse — a consumer calls this function and only ever sees
 * `Recommendation`s back; it never imports or inspects an `AIProposal` directly. The transformer
 * runs exactly once per proposal, in the order the platform returned them.
 */
export async function consumeAIPlatform<TContext extends AIContext>(
  platform: AIPlatform<TContext>,
  context: TContext,
  transform: AIProposalToRecommendationTransformer,
): Promise<readonly Recommendation[]> {
  const proposals = await platform.propose(context);
  return proposals.map(transform);
}
