import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

import { CommitmentModel } from '@/features/commitments/models/commitment.model.js';

export interface TodayWidgetProps {
  commitments: CommitmentModel[];
  onCommitmentPress: (id: string) => void;
}

export const TodayWidget = React.memo(function TodayWidget({ commitments, onCommitmentPress }: TodayWidgetProps) {
  const { t } = useTranslation();

  // useMemo used as per Track C performance requirements
  const activeCommitments = useMemo(() => {
    return commitments.filter((c) => c.status === 'active');
  }, [commitments]);

  return (
    <Card variant="elevated" interactive={false}>
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.todayCommitments', 'Compromisos de hoy')}
          </Text>
          <Text fontSize="$4" color="$contentTertiary">
            {activeCommitments.length}
          </Text>
        </XStack>

        <YStack gap="$2">
          {activeCommitments.length === 0 ? (
            <Text color="$contentSecondary" fontSize="$3">
              {t('dashboard.allCompleted', '¡Todo completado por hoy!')}
            </Text>
          ) : (
            activeCommitments.slice(0, 3).map((commitment) => (
              <XStack
                key={commitment.id}
                backgroundColor="$surface"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$divider"
                alignItems="center"
                onPress={() => onCommitmentPress(commitment.id)}
                pressStyle={{ opacity: 0.7 }}
              >
                <YStack width={12} height={12} borderRadius={6} backgroundColor="$accent" marginRight="$3" />
                <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1}>
                  {commitment.title}
                </Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
