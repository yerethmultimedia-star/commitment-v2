import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@commitment/design-system';

import { useRouter } from 'expo-router';
import { useCommitments } from '@/features/commitments/hooks/useCommitments.js';

export const TodayWidget = React.memo(function TodayWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: commitments = [] } = useCommitments();

  // useMemo used as per Track C performance requirements
  const activeCommitments = useMemo(() => {
    return commitments.filter((c) => c.status === 'active');
  }, [commitments]);

  const onCommitmentPress = (id: string) => {
    router.push(`/(tabs)/commitments/${id}` as any);
  };

  return (
    <Card variant="elevated" interactive={false}>
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.widgets.today.title')}
          </Text>
          <Text fontSize="$4" color="$contentTertiary" accessibilityLabel={t('dashboard.widgets.today.remaining', { count: activeCommitments.length })}>
            {activeCommitments.length}
          </Text>
        </XStack>

        <YStack gap="$2">
          {activeCommitments.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Text color="$contentPrimary" fontWeight="bold" fontSize="$4">
                {t('dashboard.widgets.today.empty.title')}
              </Text>
              <Text color="$contentSecondary" fontSize="$3" marginTop="$1">
                {t('dashboard.widgets.today.empty.description')}
              </Text>
            </YStack>
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
                accessibilityLabel={t('dashboard.widgets.today.itemA11y', { title: commitment.title })}
                accessibilityRole="button"
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
