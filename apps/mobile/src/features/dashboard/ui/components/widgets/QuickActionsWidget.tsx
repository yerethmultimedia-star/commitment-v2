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

export interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

export const QuickActionsWidget = React.memo(function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card variant="flat" backgroundColor="transparent" borderWidth={0} padding="$0">
      <YStack space="$3">
        <Text fontSize="$4" fontWeight="600" color="$contentPrimary" marginLeft="$2">
          {t('dashboard.quickActions', 'Acciones Rápidas')}
        </Text>
        
        <XStack space="$3" flexWrap="wrap">
          {actions.map((action) => (
            <YStack
              key={action.id}
              alignItems="center"
              space="$2"
              flex={1}
              minWidth={70}
              onPress={action.onPress}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
            >
              <Circle size={56} backgroundColor="$surfaceRaised" shadowColor="$contentPrimary" shadowOpacity={0.05} shadowRadius={8}>
                {/* Temporary placeholder for Icon Token resolution */}
                <Text fontSize="$5">{action.iconToken === 'plus' ? '➕' : '✨'}</Text>
              </Circle>
              <Text fontSize="$3" color="$contentSecondary" textAlign="center" numberOfLines={1}>
                {t(action.i18nKey, action.id)}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </Card>
  );
});
