import React from 'react';
import { DashboardLayout, WidgetCapabilities } from '@commitment/domain';

export interface WidgetDefinition {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  emptyStateKey?: string;
  accessibilityKey?: string;
  iconToken: string;
  category: string;
  priority: number;
  defaultSize: 'small' | 'medium' | 'large';
  component: React.ComponentType<any>;
  capabilities: WidgetCapabilities;
  featureFlags: string[];
  permissions: string[];
  minimumAppVersion?: string;
}

export class WidgetRegistry {
  private widgets = new Map<string, WidgetDefinition>();

  register(widget: WidgetDefinition): void {
    if (this.widgets.has(widget.id)) {
      console.warn(`Widget ${widget.id} is already registered. Use replace() to overwrite.`);
      return;
    }
    this.widgets.set(widget.id, widget);
  }

  unregister(id: string): void {
    this.widgets.delete(id);
  }

  replace(widget: WidgetDefinition): void {
    this.widgets.set(widget.id, widget);
  }

  exists(id: string): boolean {
    return this.widgets.has(id);
  }

  getDefinition(id: string): WidgetDefinition | undefined {
    return this.widgets.get(id);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  getVisible(layout: DashboardLayout): WidgetDefinition[] {
    // 1. Get visible widgets from layout
    const visibleWidgetIds = layout.widgets
      .filter(w => w.visibility === 'visible')
      .sort((a, b) => a.position - b.position)
      .map(w => w.widgetId);

    // 2. Resolve them against registry
    const visibleDefinitions = visibleWidgetIds
      .map(id => this.widgets.get(id))
      .filter((def): def is WidgetDefinition => def !== undefined);

    // 3. We could apply feature flags and permissions filtering here in the future
    return visibleDefinitions;
  }
}

// Singleton instance for the application
export const appWidgetRegistry = new WidgetRegistry();
