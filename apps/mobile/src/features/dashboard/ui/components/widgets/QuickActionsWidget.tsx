import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text, Circle } from 'tamagui';
import { Card } from '@commitment/design-system';

export interface QuickAction {
  id: string;
  iconToken: string; // E.g., 'plus', 'calendar', 'settings'
  i18nKey: string;
  onPress: () => void;
}

import { useRouter } from 'expo-router';
import { useUiStore } from '@/core/store/use-ui-store';

export const QuickActionsWidget = React.memo(function QuickActionsWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const openQuickCapture = useUiStore((s) => s.openQuickCapture);

  const actions = useMemo(() => [
    {
      id: 'add',
      iconToken: 'plus',
      i18nKey: 'dashboard.widgets.quickActions.actionAdd',
      onPress: () => openQuickCapture('today'),
    },
    {
      id: 'calendar',
      iconToken: 'calendar',
      i18nKey: 'dashboard.widgets.quickActions.actionCalendar',
      onPress: () => router.push('/calendar' as any),
    }
  ], [router, openQuickCapture]);

  return (
    <Card variant="flat" backgroundColor="transparent" borderWidth={0} padding="$0">
      <YStack gap="$3">
        <Text fontSize="$4" fontWeight="600" color="$contentPrimary" marginLeft="$2" accessibilityRole="header">
          {t('dashboard.widgets.quickActions.title')}
        </Text>
        
        <XStack gap="$3" flexWrap="wrap">
          {actions.map((action) => (
            <YStack
              key={action.id}
              alignItems="center"
              gap="$2"
              flex={1}
              minWidth={70}
              onPress={action.onPress}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
              accessibilityRole="button"
              accessibilityLabel={t(action.i18nKey)}
            >
              <Circle size={56} backgroundColor="$surfaceRaised" shadowColor="$contentPrimary" shadowOpacity={0.05} shadowRadius={8}>
                {/* Temporary placeholder for Icon Token resolution */}
                <Text fontSize="$5">{action.iconToken === 'plus' ? '➕' : '✨'}</Text>
              </Circle>
              <Text fontSize="$3" color="$contentSecondary" textAlign="center" numberOfLines={1}>
                {t(action.i18nKey)}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </Card>
  );
});
