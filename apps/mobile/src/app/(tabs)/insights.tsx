/**
 * InsightsScreen — "Tu Progreso" overview.
 *
 * Architecture:
 *   useInsightsOverview()
 *     → useInsightsContext()    (assembles InsightsContext from stores, goal-grouped)
 *     → InsightsLayoutEngine.resolveOverview (pure, deterministic)
 *     → InsightsOverviewDescriptor
 *
 * A fixed 4-stat-card + streak-row layout — no Registry/Renderer indirection
 * (unlike Dashboard), since there's no runtime-varying card membership to
 * resolve. The "More" section below reuses the 3 pre-existing insight cards
 * (Goal Progress / Habit Consistency / Streak Highlight) directly, imported
 * and rendered inline for the same reason.
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Title, AppScreen } from '@commitment/design-system';
import { Calendar } from '@tamagui/lucide-icons';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { TimeRangeTabs } from '@/features/insights/ui/components/TimeRangeTabs';
import { StatCard } from '@/features/insights/ui/components/StatCard';
import { WeekActivityRow } from '@/features/insights/ui/components/WeekActivityRow';
import { GoalProgressInsight } from '@/features/insights/ui/components/GoalProgressInsight';
import { HabitConsistencyInsight } from '@/features/insights/ui/components/HabitConsistencyInsight';
import { StreakHighlightInsight } from '@/features/insights/ui/components/StreakHighlightInsight';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';

const STAT_CARD_META: Record<string, { titleKey: string; valueFormatter: (v: number) => string }> = {
  goalsCompleted: { titleKey: 'insights.overview.stats.goalsCompleted.title', valueFormatter: (v) => String(v) },
  tasksCompleted: { titleKey: 'insights.overview.stats.tasksCompleted.title', valueFormatter: (v) => String(v) },
  productivity: { titleKey: 'insights.overview.stats.productivity.title', valueFormatter: (v) => `${v}%` },
  focusMinutes: { titleKey: 'insights.overview.stats.focusMinutes.title', valueFormatter: (v) => `${v} min` },
};

export default function InsightsScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { overview, isLoading, isError } = useInsightsOverview();
  const tabBarInset = useTabBarHeightStore((s) => s.reservedHeight);

  return (
    <AppScreen scrollable announceOnFocus="Insights screen loaded" contentBottomInset={tabBarInset}>
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        <XStack alignItems="center" gap="$2">
          <Calendar size={20} color="$contentSecondary" />
          <Title i18nKey="insights.overview.title" fontSize="$7" fontWeight="bold" />
        </XStack>

        {isLoading && <LoadingState />}
        {/* isError only reflects a genuine auth failure (no identityId) — same policy as Dashboard's own error state, nothing retry-able here without re-authenticating. */}
        {isError && (
          <Text color="$danger" fontSize="$5" fontWeight="600" textAlign="center">
            {t('insights.error.description')}
          </Text>
        )}

        {!isLoading && !isError && overview && (
          <>
            <TimeRangeTabs
              activeRange={overview.activeRange}
              enabledRanges={overview.enabledRanges}
              onChange={() => {
                // Only 'week' is enabled today (Month/Quarter/Year are visibly
                // disabled) — nothing to switch to yet.
              }}
            />

            <Title i18nKey="insights.overview.weeklySummary" fontSize="$5" />
            <YStack gap="$3">
              {overview.statCards.map((card) => {
                const meta = STAT_CARD_META[card.id];
                return (
                  <StatCard
                    key={card.id}
                    titleKey={meta.titleKey}
                    value={card.value}
                    valueFormatter={meta.valueFormatter}
                    delta={card.delta}
                    sparklinePoints={card.sparkline}
                    onPress={card.id === 'focusMinutes' ? () => router.push('/insights/focus' as any) : undefined}
                    testID={`stat-card-${card.id}`}
                  />
                );
              })}
            </YStack>

            <Title i18nKey="insights.overview.currentStreak" fontSize="$5" />
            <WeekActivityRow flags={overview.weekActivity} />

            {/* Not in the mockup — preserved from the old flat insight-card layout so goal-progress-at-a-glance and habit-consistency don't lose their only home in the app. */}
            <Title i18nKey="insights.overview.more" fontSize="$5" />
            <YStack gap="$3">
              <GoalProgressInsight />
              <HabitConsistencyInsight />
              <StreakHighlightInsight />
            </YStack>
          </>
        )}
      </YStack>
    </AppScreen>
  );
}
