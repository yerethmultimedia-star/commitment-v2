import { useMemo } from 'react';
import { useGoalsView } from './useGoalsView';

export interface GoalFocusItem {
  goalId: string;
  goalTitle: string;
  progress: number;
  kind: 'needs-attention' | 'close-to-completion';
}

const NEEDS_ATTENTION_THRESHOLD = 0.35;
const CLOSE_TO_COMPLETION_THRESHOLD = 0.85;

/**
 * Goal-aware Coach insight. Deliberately NOT part of RecommendationEngine's
 * getRecommendations(DashboardContext) — DashboardContext is a narrow
 * aggregate summary shared with the deterministic LayoutEngine, and
 * per-Goal detail doesn't belong there. This hook queries Goals directly,
 * same seam as Calendar's useDayAgenda bypassing DashboardContext for its
 * own richer data need.
 */
export function useGoalFocus(): GoalFocusItem[] {
  const { data: goals } = useGoalsView();

  return useMemo(() => {
    const active = (goals ?? []).filter((g) => g.state === 'Active');
    if (active.length === 0) return [];

    const items: GoalFocusItem[] = [];

    const lowest = [...active].sort((a, b) => a.progress - b.progress)[0];
    if (lowest && lowest.progress < NEEDS_ATTENTION_THRESHOLD) {
      items.push({ goalId: lowest.id, goalTitle: lowest.title, progress: lowest.progress, kind: 'needs-attention' });
    }

    const highest = [...active].sort((a, b) => b.progress - a.progress)[0];
    if (highest && highest.progress >= CLOSE_TO_COMPLETION_THRESHOLD && highest.progress < 1 && highest.id !== lowest?.id) {
      items.push({ goalId: highest.id, goalTitle: highest.title, progress: highest.progress, kind: 'close-to-completion' });
    }

    return items;
  }, [goals]);
}
