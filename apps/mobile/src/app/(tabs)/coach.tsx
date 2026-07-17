import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack, Circle } from 'tamagui';
import { TrendingDown, TrendingUp, Plus, Activity } from '@tamagui/lucide-icons';
import { AppScreen, Card, Title, Body, IconButton, Button, EmptyState, SectionPrimitive } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { Recommendation, RecommendationType } from '@commitment/domain';
import { getRecommendations } from '@/features/dashboard/engine/recommendation/RecommendationEngine';
import { useDashboardContext } from '@/features/dashboard/hooks/useDashboardContext';
import { useGoalFocus } from '@/features/goals/hooks/useGoalFocus';
import { useUiStore, QuickCapturePrefill } from '@/core/store/use-ui-store';
import { descriptorFor } from '@/features/coach/utils/coach-descriptors';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';

const SECTIONS: Array<{ type: RecommendationType; titleKey: string; tone: string; suggestion?: boolean }> = [
  { type: 'COACH_TIP', titleKey: 'coach.sections.priorityRecommendations', tone: '$accent' },
  { type: 'COACH_OPPORTUNITY', titleKey: 'coach.sections.opportunities', tone: '$interactive' },
  { type: 'COACH_ACHIEVEMENT', titleKey: 'coach.sections.achievements', tone: '$success' },
  { type: 'COACH_RISK', titleKey: 'coach.sections.upcomingRisks', tone: '$danger' },
  { type: 'COACH_SUGGESTED_GOAL', titleKey: 'coach.sections.suggestedGoals', tone: '$accent', suggestion: true },
  { type: 'COACH_SUGGESTED_HABIT', titleKey: 'coach.sections.suggestedHabits', tone: '$accent', suggestion: true },
  { type: 'COACH_SUGGESTED_TASK', titleKey: 'coach.sections.suggestedTasks', tone: '$accent', suggestion: true },
];

export default function CoachScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { context, isLoading } = useDashboardContext();
  const goalFocusItems = useGoalFocus();
  const openQuickCapture = useUiStore((s) => s.openQuickCapture);
  const openQuickCaptureWithPrefill = useUiStore((s) => s.openQuickCaptureWithPrefill);
  const tabBarInset = useTabBarHeightStore((s) => s.reservedHeight);

  const recommendations = useMemo(() => {
    if (!context) return [];
    return getRecommendations(context);
  }, [context]);

  const topRecommendation = recommendations[0] ?? null;

  const momentum = useMemo(() => {
    if (!context) return null;
    if (context.streak.currentStreakDays >= 3) return 'building' as const;
    if (context.tasks.completedThisWeek > 0) return 'steady' as const;
    return 'needsAttention' as const;
  }, [context]);

  const handleAcceptSuggestion = (rec: Recommendation) => {
    const captureType = rec.metadata?.captureType as QuickCapturePrefill['type'] | undefined;
    const prefillTextKey = rec.metadata?.prefillTextKey as string | undefined;
    if (!captureType || !prefillTextKey) return;
    openQuickCaptureWithPrefill('coach', { type: captureType, text: t(prefillTextKey) });
  };

  const renderRecommendationCard = (rec: Recommendation, options?: { suggestion?: boolean }) => {
    const descriptor = descriptorFor(rec.targetId);
    const Icon = descriptor.icon;
    return (
      <Card
        key={`${rec.type}-${rec.targetId}`}
        variant="elevated"
        accessibilityRole="text"
        accessibilityLabel={String(t(`${descriptor.i18nKey}.title`, rec.metadata as any))}
      >
        <XStack gap="$3" alignItems="center">
          <Circle size={44} backgroundColor="$focus" justifyContent="center" alignItems="center">
            <Icon color="$accent" size={22} />
          </Circle>
          <YStack flex={1} gap="$1">
            <Title
              fontSize="$subtitle"
              lineHeight="$subtitle"
              i18nKey={`${descriptor.i18nKey}.title`}
              i18nParams={rec.metadata as Record<string, any>}
            />
            <Body
              tone="secondary"
              i18nKey={`${descriptor.i18nKey}.description`}
              i18nParams={rec.metadata as Record<string, any>}
            />
          </YStack>
          {options?.suggestion && (
            <Button
              variant="secondary"
              size="small"
              i18nKey="coach.addSuggestion"
              onPress={() => handleAcceptSuggestion(rec)}
            />
          )}
        </XStack>
      </Card>
    );
  };

  return (
    <AppScreen scrollable announceOnFocus="Coach screen loaded" contentBottomInset={tabBarInset}>
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap="$1" flex={1}>
            <Title i18nKey="coach.title" />
            <Body i18nKey="coach.subtitle" tone="secondary" />
          </YStack>
          <IconButton
            variant="ghost"
            iconToken={<Plus color="$accent" />}
            tooltipI18nKey="coach.quickCapture"
            accessibilityHintI18nKey="coach.quickCaptureHint"
            onPress={() => openQuickCapture('coach')}
          />
        </XStack>

        {isLoading ? (
          <Body i18nKey="coach.loading" tone="secondary" />
        ) : recommendations.length === 0 ? (
          <EmptyState fullscreen={false} title={{ i18nKey: 'coach.empty.title' }} description={{ i18nKey: 'coach.empty.description' }} />
        ) : (
          <YStack gap="$5">
            {topRecommendation && (
              <SectionPrimitive title={{ i18nKey: 'coach.sections.todayRecommendation' }}>
                <Card variant="elevated" backgroundColor="$accent" borderColor="transparent">
                  <XStack gap="$3" alignItems="center">
                    <Circle size={44} justifyContent="center" alignItems="center">
                      {/* Translucent backing layer kept separate from the icon
                          sibling below — opacity on a shared parent would fade the icon too. */}
                      <Circle position="absolute" size={44} backgroundColor="$contentOnAccent" opacity={0.2} />
                      {(() => {
                        const Icon = descriptorFor(topRecommendation.targetId).icon;
                        return <Icon color="$contentOnAccent" size={22} />;
                      })()}
                    </Circle>
                    <YStack flex={1} gap="$1">
                      <Title
                        fontSize="$subtitle"
                        lineHeight="$subtitle"
                        color="$contentOnAccent"
                        i18nKey={`${descriptorFor(topRecommendation.targetId).i18nKey}.title`}
                        i18nParams={topRecommendation.metadata as Record<string, any>}
                      />
                      <Body
                        color="$contentOnAccent"
                        opacity={0.9}
                        i18nKey={`${descriptorFor(topRecommendation.targetId).i18nKey}.description`}
                        i18nParams={topRecommendation.metadata as Record<string, any>}
                      />
                    </YStack>
                  </XStack>
                </Card>
              </SectionPrimitive>
            )}

            {momentum && (
              <SectionPrimitive title={{ i18nKey: 'coach.sections.momentum' }}>
                <Card variant="elevated">
                  <XStack gap="$3" alignItems="center">
                    <Circle size={44} backgroundColor="$focus" justifyContent="center" alignItems="center">
                      <Activity color="$accent" size={22} />
                    </Circle>
                    <YStack flex={1} gap="$1">
                      <Title fontSize="$subtitle" lineHeight="$subtitle" i18nKey={`coach.momentum.${momentum}.title`} />
                      <Body tone="secondary" i18nKey={`coach.momentum.${momentum}.description`} />
                    </YStack>
                  </XStack>
                </Card>
              </SectionPrimitive>
            )}

            {goalFocusItems.length > 0 && (
              <SectionPrimitive title={{ i18nKey: 'coach.sections.goalFocus' }}>
                <YStack gap="$3">
                  {goalFocusItems.map((item) => {
                    const Icon = item.kind === 'needs-attention' ? TrendingDown : TrendingUp;
                    const i18nKey = item.kind === 'needs-attention' ? 'coach.goalFocus.needsAttention' : 'coach.goalFocus.closeToCompletion';
                    return (
                      <Card
                        key={`${item.kind}-${item.goalId}`}
                        variant="elevated"
                        clickable
                        onPress={() => router.push(`/goals/${item.goalId}` as any)}
                        pressStyle={{ opacity: 0.9 }}
                        accessibilityLabel={String(t(`${i18nKey}.title`, { title: item.goalTitle }))}
                      >
                        <XStack gap="$3" alignItems="center">
                          <Circle size={44} backgroundColor="$focus" justifyContent="center" alignItems="center">
                            <Icon color={item.kind === 'needs-attention' ? '$danger' : '$success'} size={22} />
                          </Circle>
                          <YStack flex={1} gap="$1">
                            <Title
                              fontSize="$subtitle"
                              lineHeight="$subtitle"
                              i18nKey={`${i18nKey}.title`}
                              i18nParams={{ title: item.goalTitle }}
                            />
                            <Body
                              tone="secondary"
                              i18nKey={`${i18nKey}.description`}
                              i18nParams={{ percent: Math.round(item.progress * 100) }}
                            />
                          </YStack>
                        </XStack>
                      </Card>
                    );
                  })}
                </YStack>
              </SectionPrimitive>
            )}

            {SECTIONS.map((section) => {
              const items = recommendations.filter((rec) => rec.type === section.type);
              if (items.length === 0) return null;
              return (
                <SectionPrimitive key={section.type} title={{ i18nKey: section.titleKey }}>
                  <YStack gap="$3">
                    {items.map((rec) => renderRecommendationCard(rec, { suggestion: section.suggestion }))}
                  </YStack>
                </SectionPrimitive>
              );
            })}
          </YStack>
        )}
      </YStack>
    </AppScreen>
  );
}
