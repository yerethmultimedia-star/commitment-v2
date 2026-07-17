/**
 * DashboardEmptyState
 *
 * Shown when the user has no active commitments and no pending tasks.
 * All strings are i18n-keyed (no hardcoded text).
 */

import React from 'react';
import { EmptyState } from '@commitment/design-system';
import { Circle, Text } from 'tamagui';

export function DashboardEmptyState() {
  const PlaceholderIllustration = (
    <Circle size={100} backgroundColor="$backgroundSecondary" marginBottom="$4">
      <Text fontSize="$6">✨</Text>
    </Circle>
  );

  return (
    <EmptyState
      illustration={PlaceholderIllustration}
      title={{ i18nKey: 'dashboard.noCommitmentsTitle' }}
      description={{ i18nKey: 'dashboard.noCommitmentsSubtitle' }}
    />
  );
}
