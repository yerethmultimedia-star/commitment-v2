import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { YStack } from 'tamagui';

/**
 * Roadmaps doesn't exist as a domain concept anywhere yet — no aggregate,
 * no demo data, no repository. Rather than fabricate content, this shows
 * an honest empty state. Give it a real store (mirroring
 * demo-goals.repository.ts) when the concept is actually designed.
 */
export function RoadmapsTab() {
  const { t } = useTranslation('common');
  return (
    <YStack alignItems="center">
      <EmptyState
        title={t('goals.roadmaps.empty.title')}
        description={t('goals.roadmaps.empty.description')}
      />
    </YStack>
  );
}
