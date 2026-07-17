import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Card, Body, EmptyState } from '@commitment/design-system';
import { useDayAgenda } from '@/features/calendar/hooks/useDayAgenda';

const TYPE_DOT_COLOR: Record<string, string> = {
  task: '$accent',
  commitment: '$success',
  habit: '$warning',
  reminder: '$danger',
};

export const TodayAgendaWidget = React.memo(function TodayAgendaWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const { agenda, isLoading } = useDayAgenda(today);

  const items = agenda?.items ?? [];

  return (
    <Card
      variant="elevated"
      clickable
      onPress={() => router.push('/calendar' as any)}
      pressStyle={{ opacity: 0.9 }}
      accessibilityLabel={t('dashboard.widgets.todayAgenda.a11y')}
    >
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Body fontSize="$5" fontWeight="600">
            {t('dashboard.widgets.todayAgenda.title')}
          </Body>
          {/* Purely visual affordance, not a second interactive control — the
              whole Card is already clickable to this same destination, and
              nesting an independently-focusable element inside it would be
              invalid HTML (a <button> can't contain a <button>) now that
              accessibilityRole="button" renders a real one. See TD-015. */}
          <Body fontSize="$3" fontWeight="600" color="$accent">
            {t('dashboard.widgets.todayAgenda.viewAll')}
          </Body>
        </XStack>

        <YStack gap="$2">
          {!isLoading && items.length === 0 ? (
            <EmptyState
              fullscreen={false}
              spacing="compact"
              title={{ i18nKey: 'dashboard.widgets.todayAgenda.empty.title' }}
              description={{ i18nKey: 'dashboard.widgets.todayAgenda.empty.description' }}
            />
          ) : (
            items.slice(0, 3).map((item) => (
              <XStack key={item.id} alignItems="center" gap="$3" paddingVertical="$1">
                {item.time && (
                  <Body fontSize="$3" tone="tertiary" width={44}>
                    {item.time}
                  </Body>
                )}
                <YStack width={8} height={8} borderRadius={4} backgroundColor={TYPE_DOT_COLOR[item.type] as any} />
                <Body fontSize="$4" numberOfLines={1} flex={1}>
                  {item.title}
                </Body>
                {item.durationMinutes && (
                  <Body fontSize="$3" tone="tertiary">
                    {t('calendar.durationMinutes', { count: item.durationMinutes })}
                  </Body>
                )}
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
