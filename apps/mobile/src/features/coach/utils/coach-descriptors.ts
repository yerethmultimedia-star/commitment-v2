import {
  Compass, Target, Zap, TrendingUp,
  Lightbulb, Award, AlertTriangle, Bell, Sparkles,
} from '@tamagui/lucide-icons';

// targetId -> (icon, i18n key stem). One entry per rule in
// CoachRecommendationProvider — keep these two lists in sync.
export const DESCRIPTORS: Record<string, { icon: React.ComponentType<any>; i18nKey: string }> = {
  'start-first-goal': { icon: Target, i18nKey: 'coach.tips.startFirstGoal' },
  'focus-today': { icon: Zap, i18nKey: 'coach.tips.focusToday' },
  // AR-036/D-036.1 — reframed from "protect-streak" (loss-aversion) to a
  // recognition of sustained consistency; icon changed from Flame to
  // TrendingUp accordingly.
  'steady-progress': { icon: TrendingUp, i18nKey: 'coach.tips.steadyProgress' },
  'weekly-momentum': { icon: TrendingUp, i18nKey: 'coach.tips.weeklyMomentum' },
  'stay-consistent': { icon: Compass, i18nKey: 'coach.tips.stayConsistent' },
  'no-habits-today': { icon: Lightbulb, i18nKey: 'coach.opportunities.noHabitsToday' },
  'plan-ahead': { icon: Lightbulb, i18nKey: 'coach.opportunities.planAhead' },
  // AR-036/D-036.1 — renamed from "week-streak"; same achievement, framed as
  // a consistency milestone rather than a streak.
  'consistency-milestone': { icon: Award, i18nKey: 'coach.achievements.consistencyMilestone' },
  // TECH_DEBT.md Item 37 (T-001) — this targetId counts Commitment entities
  // (CoachRecommendationProvider.ts), so its copy must say "commitments," not
  // "goals" — a genuine goalsCompleted achievement key already exists above
  // for whatever eventually needs it.
  'commitments-completed': { icon: Award, i18nKey: 'coach.achievements.commitmentsCompleted' },
  'all-habits-done': { icon: Award, i18nKey: 'coach.achievements.allHabitsDone' },
  // AR-036/D-036.1 — renamed from "habit-streaks-at-risk"; icon changed from
  // AlertTriangle (threat) to Bell (neutral reminder) — "heavy-day" below
  // keeps AlertTriangle since it's a genuine scheduling risk, unrelated to
  // the streak/gamification framing this AR removes.
  'habits-needing-attention': { icon: Bell, i18nKey: 'coach.risks.habitsNeedingAttention' },
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
