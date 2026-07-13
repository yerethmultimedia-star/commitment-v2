/**
 * DashboardRenderer
 *
 * Receives a DashboardLayoutDescriptor and maps each section to the
 * corresponding widget components from the WidgetRegistry.
 *
 * This component does NOT know which widgets exist.
 * It delegates rendering to WidgetRenderer via WidgetRegistry.
 */

import React from 'react';
import { Stack } from '@commitment/design-system';
import { DashboardLayoutDescriptor } from '../../engine/layout/DashboardLayoutDescriptor';
import { WidgetRenderer } from '../components/WidgetRenderer';
import { appWidgetRegistry } from '../../registry/WidgetRegistry';
import { DashboardHeroCard } from '../components/DashboardHeroCard';
import { DashboardQuickSummary } from '../components/DashboardQuickSummary';

export interface DashboardRendererProps {
  layout: DashboardLayoutDescriptor;
}

export const DashboardRenderer = React.memo(function DashboardRenderer({
  layout,
}: DashboardRendererProps) {
  const allSections = [
    ...layout.primaryWidgets,
    ...layout.secondaryWidgets,
    ...layout.footerWidgets,
  ];

  return (
    <Stack gap="$lg">
      {/* Hero Card */}
      <DashboardHeroCard descriptor={layout.hero} />

      {/* Quick Summary Row */}
      <DashboardQuickSummary summary={layout.quickSummary} />

      {/* Widget sections rendered in order: primary → secondary → footer */}
      <Stack gap="$md">
        {allSections.map((slot) => {
          const definition = appWidgetRegistry.getDefinition(slot.widgetId);
          if (!definition) return null;
          return (
            <WidgetRenderer
              key={slot.widgetId}
              widget={definition}
            />
          );
        })}
      </Stack>
    </Stack>
  );
});
