import React from 'react';
import { Stack as ExpoStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { AppScreen, LoadingState, ErrorState, EmptyState } from '@commitment/design-system';
import { useFocusDetail } from '../../hooks/useFocusDetail';
import { FocusDayBarChart } from '../components/FocusDayBarChart';
import { BestWorstDayCard } from '../components/BestWorstDayCard';

export function FocusDetailScreen() {
  const { t } = useTranslation('common');
  const { days, averageMinutes, bestDay, worstDay, isLoading, isError } = useFocusDetail();

  return (
    <AppScreen scrollable>
      <ExpoStack.Screen options={{ headerShown: true, title: t('insights.focus.title'), presentation: 'card' }} />
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        {isLoading && <LoadingState fullscreen={false} title={{ i18nKey: 'insights.loading' }} />}
        {isError && (
          <ErrorState fullscreen={false} title={{ i18nKey: 'insights.error.description' }} />
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
              <EmptyState fullscreen={false} title={{ i18nKey: 'insights.focus.empty' }} />
            )}
          </>
        )}
      </YStack>
    </AppScreen>
  );
}
