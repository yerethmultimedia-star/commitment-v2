import {
  Compass, Target, Zap, Flame, TrendingUp,
  Lightbulb, Award, AlertTriangle, Sparkles,
} from '@tamagui/lucide-icons';

// targetId -> (icon, i18n key stem). One entry per rule in
// CoachRecommendationProvider — keep these two lists in sync.
export const DESCRIPTORS: Record<string, { icon: React.ComponentType<any>; i18nKey: string }> = {
  'start-first-goal': { icon: Target, i18nKey: 'coach.tips.startFirstGoal' },
  'focus-today': { icon: Zap, i18nKey: 'coach.tips.focusToday' },
  'protect-streak': { icon: Flame, i18nKey: 'coach.tips.protectStreak' },
  'weekly-momentum': { icon: TrendingUp, i18nKey: 'coach.tips.weeklyMomentum' },
  'stay-consistent': { icon: Compass, i18nKey: 'coach.tips.stayConsistent' },
  'no-habits-today': { icon: Lightbulb, i18nKey: 'coach.opportunities.noHabitsToday' },
  'plan-ahead': { icon: Lightbulb, i18nKey: 'coach.opportunities.planAhead' },
  'week-streak': { icon: Award, i18nKey: 'coach.achievements.weekStreak' },
  // TECH_DEBT.md Item 37 (T-001) — this targetId counts Commitment entities
  // (CoachRecommendationProvider.ts), so its copy must say "commitments," not
  // "goals" — a genuine goalsCompleted achievement key already exists above
  // for whatever eventually needs it.
  'commitments-completed': { icon: Award, i18nKey: 'coach.achievements.commitmentsCompleted' },
  'all-habits-done': { icon: Award, i18nKey: 'coach.achievements.allHabitsDone' },
  'habit-streaks-at-risk': { icon: AlertTriangle, i18nKey: 'coach.risks.habitStreaksAtRisk' },
  'heavy-day': { icon: AlertTriangle, i18nKey: 'coach.risks.heavyDay' },
  'first-goal': { icon: Sparkles, i18nKey: 'coach.suggestions.goals.firstGoal' },
  'drink-water': { icon: Sparkles, i18nKey: 'coach.suggestions.habits.drinkWater' },
  'stretch': { icon: Sparkles, i18nKey: 'coach.suggestions.habits.stretch' },
  'plan-tomorrow': { icon: Sparkles, i18nKey: 'coach.suggestions.tasks.planTomorrow' },
};

export const FALLBACK_DESCRIPTOR = { icon: Compass, i18nKey: 'coach.tips.stayConsistent' };

export function descriptorFor(targetId: string) {
  return DESCRIPTORS[targetId] ?? FALLBACK_DESCRIPTOR;
}
