/**
 * DashboardEmptyState
 *
 * Shown when the user has no active commitments and no pending tasks.
 * All strings are i18n-keyed (no hardcoded text).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@commitment/design-system';
import { Circle, Text } from 'tamagui';

export function DashboardEmptyState() {
  const { t } = useTranslation('common');

  const PlaceholderIllustration = (
    <Circle size={100} backgroundColor="$backgroundSecondary" marginBottom="$4">
      <Text fontSize="$6">✨</Text>
    </Circle>
  );

  return (
    <EmptyState
      illustration={PlaceholderIllustration}
      title={t('dashboard.noCommitmentsTitle')}
      description={t('dashboard.noCommitmentsSubtitle')}
    />
  );
}
