import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { Card } from '@commitment/design-system';
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
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.widgets.todayAgenda.title')}
          </Text>
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$accent"
            onPress={() => router.push('/calendar' as any)}
          >
            {t('dashboard.widgets.todayAgenda.viewAll')}
          </Text>
        </XStack>

        <YStack gap="$2">
          {!isLoading && items.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Text color="$contentPrimary" fontWeight="bold" fontSize="$4">
                {t('dashboard.widgets.todayAgenda.empty.title')}
              </Text>
              <Text color="$contentSecondary" fontSize="$3" marginTop="$1">
                {t('dashboard.widgets.todayAgenda.empty.description')}
              </Text>
            </YStack>
          ) : (
            items.slice(0, 3).map((item) => (
              <XStack key={item.id} alignItems="center" gap="$3" paddingVertical="$1">
                {item.time && (
                  <Text fontSize="$3" color="$contentTertiary" width={44}>
                    {item.time}
                  </Text>
                )}
                <YStack width={8} height={8} borderRadius={4} backgroundColor={TYPE_DOT_COLOR[item.type] as any} />
                <Text color="$contentPrimary" fontSize="$4" numberOfLines={1} flex={1}>
                  {item.title}
                </Text>
                {item.durationMinutes && (
                  <Text fontSize="$3" color="$contentTertiary">
                    {t('calendar.durationMinutes', { count: item.durationMinutes })}
                  </Text>
                )}
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
