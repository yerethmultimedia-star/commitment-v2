import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@commitment/design-system';
import { Circle, Text } from 'tamagui';

export function DashboardEmptyState() {
  const { t } = useTranslation();

  // Temporary placeholder for Illustration Token. 
  // Once tokens are fully supported, this will be replaced with theme.illustrations.dashboardEmpty
  const PlaceholderIllustration = (
    <Circle size={100} backgroundColor="$backgroundSecondary" marginBottom="$4">
      <Text fontSize="$6">✨</Text>
    </Circle>
  );

  return (
    <EmptyState
      illustration={PlaceholderIllustration}
      title={t('dashboard.noCommitmentsTitle', 'Empecemos a construir hábitos')}
      description={t('dashboard.noCommitmentsSubtitle', 'Crea tu primer compromiso y da el primer paso hacia tu meta.')}
    />
  );
}
