import React from 'react';
import { YStack, XStack, Circle, View } from 'tamagui';
import { Card, Title, Body, AppScreen } from '@commitment/design-system';
import { useInsightsFacade } from '@/core/facades/insights.facade';

export default function InsightsScreen() {
  const { metrics, isLoading } = useInsightsFacade();

  const completionRate = metrics?.completionRate ?? 0;

  // Simple mock data for consistency: 14 squares (last 2 weeks)
  const consistencyDays = [
    { day: 'M', completed: true },
    { day: 'T', completed: false },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: false },
    { day: 'S', completed: true },
    { day: 'S', completed: true },
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: false },
    { day: 'T', completed: true },
    { day: 'F', completed: true },
    { day: 'S', completed: false },
    { day: 'S', completed: true },
  ];

  // Simple mock data for weekly trend (last 5 weeks)
  const trendWeeks = [45, 60, 55, 78, completionRate];

  return (
    <AppScreen scrollable announceOnFocus="Insights screen loaded">
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        <Title i18nKey="insights.title" fontSize="$7" fontWeight="bold" />

        {isLoading ? (
          <Body i18nKey="loading" />
        ) : (
          <YStack gap="$4">
            {/* Focus Score Gauge */}
            <Card variant="elevated" gap="$3" alignItems="center" padding="$5">
              <Title i18nKey="insights.focusScore" fontSize="$5" />
              <Circle size={100} borderWidth={8} borderColor="$success" justifyContent="center" alignItems="center">
                <Title fontSize="$7" fontWeight="bold" color="$success">
                  {completionRate}%
                </Title>
              </Circle>
              <Body i18nKey="insights.focusScoreDesc" tone="secondary" textAlign="center" fontSize="$3" />
            </Card>

            {/* Weekly Consistency Grid */}
            <Card variant="elevated" gap="$3">
              <Title i18nKey="insights.weeklyConsistency" fontSize="$5" />
              <XStack gap="$2" flexWrap="wrap" justifyContent="center">
                {consistencyDays.map((item, index) => (
                  <View 
                    key={index}
                    width={32}
                    height={32}
                    borderRadius={4}
                    backgroundColor={item.completed ? '$success' : '$surfaceRaised'}
                    borderWidth={1}
                    borderColor="$divider"
                    justifyContent="center"
                    alignItems="center"
                    opacity={item.completed ? 0.8 : 0.4}
                  >
                    <Body fontSize="$2" fontWeight="bold" color={item.completed ? 'white' : '$contentSecondary'}>
                      {item.day}
                    </Body>
                  </View>
                ))}
              </XStack>
            </Card>

            {/* Completion Trend Bar Chart */}
            <Card variant="elevated" gap="$3">
              <Title i18nKey="insights.completionTrend" fontSize="$5" />
              <XStack height={120} alignItems="flex-end" justifyContent="space-between" paddingHorizontal="$4">
                {trendWeeks.map((val, idx) => (
                  <YStack key={idx} alignItems="center" gap="$2" flex={1}>
                    <Body fontSize="$2" fontWeight="bold" color="$contentSecondary">
                      {val}%
                    </Body>
                    <View 
                      width={24}
                      height={`${(val / 100) * 80}%` as any}
                      backgroundColor="$interactive"
                      borderRadius={4}
                    />
                    <Body fontSize="$2" tone="secondary">
                      W{idx + 1}
                    </Body>
                  </YStack>
                ))}
              </XStack>
            </Card>

            {/* Streak Calendar Card */}
            <Card variant="elevated" gap="$3">
              <Title i18nKey="insights.streakCalendar" fontSize="$5" />
              <XStack alignItems="center" gap="$3" padding="$2">
                <Circle size={48} backgroundColor="$orange9" justifyContent="center" alignItems="center">
                  <Body fontSize="$6">🔥</Body>
                </Circle>
                <YStack>
                  <Title fontSize="$6" fontWeight="bold">
                    {metrics.completedThisWeek} Days
                  </Title>
                  <Body i18nKey="insights.streakDesc" tone="secondary" />
                </YStack>
              </XStack>
            </Card>
          </YStack>
        )}
      </YStack>
    </AppScreen>
  );
}
