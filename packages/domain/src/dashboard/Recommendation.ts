/**
 * Recommendation
 *
 * A pure data model produced by the RecommendationEngine and consumed
 * by the DashboardLayoutEngine.
 *
 * No React imports. No UI concerns.
 */

export type RecommendationType =
  | 'PROMOTE_WIDGET'   // elevate a widget to a higher position
  | 'DEMOTE_WIDGET'    // move a widget lower
  | 'HIDE_WIDGET'      // remove widget from current layout
  | 'SHOW_WIDGET'      // surface a hidden widget
  | 'PIN_HERO'         // set specific hero card variant
  | 'INSERT_INSIGHT'   // inject an insight into the layout
  | 'COACH_TIP'                // priority coaching tip on the Coach screen
  | 'COACH_OPPORTUNITY'        // something the user could start/improve
  | 'COACH_ACHIEVEMENT'        // something worth celebrating
  | 'COACH_RISK'                // something at risk of slipping
  | 'COACH_SUGGESTED_HABIT'    // a habit worth adding — Quick Capture prefill
  | 'COACH_SUGGESTED_GOAL'     // a goal worth adding — Quick Capture prefill
  | 'COACH_SUGGESTED_TASK';    // a task worth adding — Quick Capture prefill

export interface Recommendation {
  readonly type: RecommendationType;
  /** Target widget or insight identifier */
  readonly targetId: string;
  /** Provider that produced this recommendation */
  readonly source: string;
  /** Higher = higher priority when resolving conflicts */
  readonly priority: number;
  /** Optional arbitrary metadata for the engine */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
