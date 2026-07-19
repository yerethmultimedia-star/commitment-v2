import React from 'react';
import { Stack as ExpoStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { AppScreen, Body, LoadingState, ErrorState, EmptyState } from '@commitment/design-system';
import { useFocusDetail } from '../../hooks/useFocusDetail';
import { FocusDayBarChart } from '../components/FocusDayBarChart';
import { FocusStatsSummary } from '../components/FocusStatsSummary';

// Sprint de Estabilización, Fase 2.5 — chart-first redesign ("Opción B").
// The bar chart is the screen's dominant element; Best/Worst/Average
// condensed into one compact section below it (see FocusStatsSummary),
// replacing two large Cards that competed with the chart for attention.
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
            <Body tone="secondary" fontSize="$3" fontWeight="600">{t('insights.focus.thisWeek')}</Body>
            <FocusDayBarChart days={days} averageMinutes={averageMinutes} />

            {bestDay && worstDay ? (
              <FocusStatsSummary averageMinutes={averageMinutes} bestDay={bestDay} worstDay={worstDay} />
            ) : (
              <EmptyState fullscreen={false} title={{ i18nKey: 'insights.focus.empty' }} />
            )}
          </>
        )}
      </YStack>
    </AppScreen>
  );
}
