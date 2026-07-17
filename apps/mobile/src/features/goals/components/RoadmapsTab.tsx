import React from 'react';
import { EmptyState } from '@commitment/design-system';

/**
 * Roadmaps doesn't exist as a domain concept anywhere yet — no aggregate,
 * no demo data, no repository. Rather than fabricate content, this shows
 * an honest empty state. Give it a real store (mirroring
 * demo-goals.repository.ts) when the concept is actually designed.
 */
export function RoadmapsTab() {
  return (
    <EmptyState
      fullscreen={false}
      title={{ i18nKey: 'goals.roadmaps.empty.title' }}
      description={{ i18nKey: 'goals.roadmaps.empty.description' }}
    />
  );
}
