/**
 * RecommendationEngine
 *
 * Aggregates all configured providers and returns a deduplicated,
 * priority-sorted list of Recommendation objects.
 *
 * CONSTRAINT: This function is a pure computation.
 * It must not access Zustand, React Context, or any I/O.
 */

import { DashboardContext, Recommendation } from '@commitment/domain';
import { recommendationProviders } from './recommendationConfig';

/**
 * Collect recommendations from all providers, deduplicate by
 * (type + targetId) keeping the highest-priority entry, then
 * sort descending by priority.
 */
export function getRecommendations(
  context: DashboardContext,
): Recommendation[] {
  const all: Recommendation[] = recommendationProviders.flatMap((provider) =>
    provider.getRecommendations(context),
  );

  // Deduplicate: for each (type, targetId) keep highest priority
  const deduped = new Map<string, Recommendation>();
  for (const rec of all) {
    const key = `${rec.type}::${rec.targetId}`;
    const existing = deduped.get(key);
    if (!existing || rec.priority > existing.priority) {
      deduped.set(key, rec);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => b.priority - a.priority);
}
