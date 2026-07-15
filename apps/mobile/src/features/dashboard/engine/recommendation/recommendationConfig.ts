/**
 * recommendationConfig
 *
 * Ordered list of providers composed into the RecommendationEngine.
 * To add a new provider (e.g. AIRecommendationProvider in VS-034),
 * import it here and append it to the array.
 *
 * Order matters: providers run in sequence; later providers may
 * override recommendations from earlier ones at equal priority.
 */

import { RecommendationProvider } from './RecommendationProvider';
import { RuleRecommendationProvider } from './RuleRecommendationProvider';
import { CoachRecommendationProvider } from './CoachRecommendationProvider';

export const recommendationProviders: RecommendationProvider[] = [
  new RuleRecommendationProvider(),
  new CoachRecommendationProvider(),
  // VS-034: new AIRecommendationProvider(),
  // VS-034: new ExperimentRecommendationProvider(),
];
