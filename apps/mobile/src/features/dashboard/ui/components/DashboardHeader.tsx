import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text, Circle } from 'tamagui';

export interface DashboardHeaderProps {
  commitmentsCount: number;
}

export const DashboardHeader = React.memo(function DashboardHeader({ commitmentsCount }: DashboardHeaderProps) {
  const { t } = useTranslation();

  const headerData = useMemo(() => {
    const hour = new Date().getHours();
    let greetingKey = 'dashboard.greetingMorning'; // "Buenos días"
    
    if (hour >= 12 && hour < 20) {
      greetingKey = 'dashboard.greetingAfternoon'; // "Buenas tardes"
    } else if (hour >= 20 || hour < 5) {
      greetingKey = 'dashboard.greetingEvening'; // "Buenas noches"
    }

    // A more complete app would use the localization SDK for this date string
    // "Miércoles, 9 de julio"
    const dateStr = new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).format(new Date());

    // Capitalize first letter of weekday
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    return { greetingKey, formattedDate };
  }, []);

  return (
    <YStack gap="$2" paddingBottom="$4">
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack gap="$1" flex={1}>
          <Text fontSize="$7" fontWeight="bold" color="$contentPrimary" letterSpacing={-0.5}>
            {t(headerData.greetingKey, 'Buenos días')}
          </Text>
          <Text fontSize="$4" color="$accent" fontWeight="500">
            {headerData.formattedDate}
          </Text>
        </YStack>
        
        {/* Placeholder for Profile / Avatar */}
        <Circle size={44} backgroundColor="$surfaceRaised" borderWidth={1} borderColor="$divider" marginLeft="$4">
          <Text fontSize="$4">👤</Text>
        </Circle>
      </XStack>

      {/* Summary Phrase */}
      <Text fontSize="$4" color="$contentSecondary" marginTop="$2">
        {commitmentsCount > 0 
          ? t('dashboard.activeCount', `Tienes ${commitmentsCount} compromisos activos hoy.`)
          : t('dashboard.noActiveCount', 'No tienes compromisos activos por ahora.')}
      </Text>
    </YStack>
  );
});
