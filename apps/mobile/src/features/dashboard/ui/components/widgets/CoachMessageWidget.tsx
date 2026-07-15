import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, Circle } from 'tamagui';
import { Bot } from '@tamagui/lucide-icons';
import { Card, Title, Body } from '@commitment/design-system';
import { getRecommendations } from '@/features/dashboard/engine/recommendation/RecommendationEngine';
import { useDashboardContext } from '@/features/dashboard/hooks/useDashboardContext';
import { descriptorFor } from '@/features/coach/utils/coach-descriptors';

/**
 * "Mensaje de tu Coach" — reuses the same deterministic, rule-based
 * recommendation the Coach screen itself highlights as "today's
 * recommendation" (CoachRecommendationProvider, no AI, no fabrication),
 * just in a compact card for Today. Always shows the coach/robot icon
 * (not the recommendation-type icon Coach's own list uses) since this
 * card is framed as a message from "your coach," not a category badge.
 */
export const CoachMessageWidget = React.memo(function CoachMessageWidget() {
  const { t } = useTranslation();
  const { context } = useDashboardContext();

  const topRecommendation = useMemo(() => {
    if (!context) return null;
    return getRecommendations(context)[0] ?? null;
  }, [context]);

  if (!topRecommendation) return null;

  const descriptor = descriptorFor(topRecommendation.targetId);

  return (
    <YStack gap="$2">
      <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
        {t('dashboard.widgets.coachMessage.label')}
      </Body>
      <Card variant="elevated" backgroundColor="$accent" borderColor="transparent">
        <XStack gap="$3" alignItems="center">
          <YStack flex={1} gap="$1">
            <Title
              fontSize="$subtitle"
              lineHeight="$subtitle"
              color="$contentOnAccent"
              i18nKey={`${descriptor.i18nKey}.title`}
              i18nParams={topRecommendation.metadata as Record<string, any>}
            />
            <Body
              color="$contentOnAccent"
              opacity={0.9}
              i18nKey={`${descriptor.i18nKey}.description`}
              i18nParams={topRecommendation.metadata as Record<string, any>}
            />
          </YStack>
          <Circle size={56} backgroundColor="rgba(255,255,255,0.2)" justifyContent="center" alignItems="center">
            <Bot color="$contentOnAccent" size={28} />
          </Circle>
        </XStack>
      </Card>
    </YStack>
  );
});
