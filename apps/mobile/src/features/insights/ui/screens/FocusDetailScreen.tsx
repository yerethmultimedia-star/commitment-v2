import React from 'react';
import { Stack as ExpoStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { AppScreen } from '@commitment/design-system';
import { useFocusDetail } from '../../hooks/useFocusDetail';
import { FocusDayBarChart } from '../components/FocusDayBarChart';
import { BestWorstDayCard } from '../components/BestWorstDayCard';
import { LoadingState } from '@/shared/ui/feedback/LoadingState';

export function FocusDetailScreen() {
  const { t } = useTranslation('common');
  const { days, averageMinutes, bestDay, worstDay, isLoading, isError } = useFocusDetail();

  return (
    <AppScreen scrollable>
      <ExpoStack.Screen options={{ headerShown: true, title: t('insights.focus.title'), presentation: 'card' }} />
      <YStack padding="$4" gap="$4">
        {isLoading && <LoadingState />}
        {isError && (
          <Text color="$danger" fontSize="$5" fontWeight="600" textAlign="center">
            {t('insights.error.description')}
          </Text>
        )}

        {!isLoading && !isError && (
          <>
            <FocusDayBarChart days={days} averageMinutes={averageMinutes} />

            {bestDay && worstDay ? (
              <XStack gap="$3">
                <BestWorstDayCard label={t('insights.focus.bestDay')} day={bestDay} />
                <BestWorstDayCard label={t('insights.focus.worstDay')} day={worstDay} />
              </XStack>
            ) : (
              <Text color="$contentSecondary" fontSize="$3" textAlign="center">
                {t('insights.focus.empty')}
              </Text>
            )}
          </>
        )}
      </YStack>
    </AppScreen>
  );
}
