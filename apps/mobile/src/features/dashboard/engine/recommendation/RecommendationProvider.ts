/**
 * RecommendationProvider
 *
 * Interface all recommendation providers must implement.
 * Providers are pure functions of DashboardContext → Recommendation[].
 *
 * CONSTRAINT: implementations MUST NOT access Zustand, React Context,
 * or any external I/O. They must be deterministic given the same input.
 */

import { DashboardContext } from '@commitment/domain';
import { Recommendation } from '@commitment/domain';

export interface RecommendationProvider {
  /** Unique identifier for this provider (used in Recommendation.source) */
  readonly id: string;

  /**
   * Produce a list of recommendations based solely on the context snapshot.
   * Must be a pure, synchronous computation.
   */
  getRecommendations(context: DashboardContext): Recommendation[];
}
