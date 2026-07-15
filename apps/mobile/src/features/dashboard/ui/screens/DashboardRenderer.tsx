/**
 * DashboardRenderer
 *
 * Receives a DashboardLayoutDescriptor and maps each section to the
 * corresponding widget components from the WidgetRegistry.
 *
 * This component does NOT know which widgets exist.
 * It delegates rendering to WidgetRenderer via WidgetRegistry.
 *
 * Today's default view only shows Agenda + Habits + the Coach message
 * (matching the target design) — the rest of the registered widgets
 * (UpcomingTasks, WeeklyProgress, CompletionRate, QuickActions,
 * CurrentStreak, RecentActivity, Motivation, the old TodayWidget) stay fully
 * registered and testable via DashboardLayoutEngine (unchanged, see its own
 * test suite) for a future personalization feature — this is a
 * presentation-layer filter, not a data model change, per explicit user
 * direction to keep that system intact.
 */

import React from 'react';
import { Stack } from '@commitment/design-system';
import { DashboardLayoutDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';
import { WidgetRenderer } from '../components/WidgetRenderer';
import { appWidgetRegistry } from '../../registry/WidgetRegistry';
import { DashboardHeroCard } from '../components/DashboardHeroCard';

export interface DashboardRendererProps {
  layout: DashboardLayoutDescriptor;
}

const TODAY_VISIBLE_WIDGET_IDS = new Set(['today-agenda-widget', 'today-habits-widget', 'coach-message-widget']);

function WidgetGroup({ widgetIds }: { widgetIds: string[] }) {
  return (
    <Stack gap="$md">
      {widgetIds.map((widgetId) => {
        const definition = appWidgetRegistry.getDefinition(widgetId);
        if (!definition) return null;
        return <WidgetRenderer key={widgetId} widget={definition} />;
      })}
    </Stack>
  );
}

export const DashboardRenderer = React.memo(function DashboardRenderer({
  layout,
}: DashboardRendererProps) {
  const visiblePrimaryIds = layout.primaryWidgets
    .map((w) => w.widgetId)
    .filter((id) => TODAY_VISIBLE_WIDGET_IDS.has(id));

  return (
    <Stack gap="$lg">
      {/* Hero Card */}
      <DashboardHeroCard descriptor={layout.hero} />

      <WidgetGroup widgetIds={visiblePrimaryIds} />
    </Stack>
  );
});
