import { appWidgetRegistry } from './WidgetRegistry.js';
import { TodayWidget } from '../ui/components/widgets/TodayWidget.js';
import { WeeklyProgressWidget } from '../ui/components/widgets/WeeklyProgressWidget.js';
import { QuickActionsWidget } from '../ui/components/widgets/QuickActionsWidget.js';

export function registerDefaultWidgets() {
  appWidgetRegistry.register({
    id: 'today-widget',
    titleKey: 'dashboard.widgets.today.title',
    descriptionKey: 'dashboard.widgets.today.description',
    emptyStateKey: 'dashboard.widgets.today.empty.title',
    accessibilityKey: 'dashboard.widgets.today.a11y',
    iconToken: 'list',
    category: 'activity',
    priority: 10,
    defaultSize: 'medium',
    component: TodayWidget,
    capabilities: {
      refreshable: true,
      collapsible: false,
      editable: false,
      offline: true,
      requiresAuth: true,
      supportsTheme: true,
      supportsAnimation: true,
    },
    featureFlags: [],
    permissions: [],
    minimumAppVersion: '1.0.0',
  });

  appWidgetRegistry.register({
    id: 'weekly-progress-widget',
    titleKey: 'dashboard.widgets.weeklyProgress.title',
    descriptionKey: 'dashboard.widgets.weeklyProgress.description',
    emptyStateKey: 'dashboard.widgets.weeklyProgress.empty.title',
    accessibilityKey: 'dashboard.widgets.weeklyProgress.a11y',
    iconToken: 'bar-chart',
    category: 'progress',
    priority: 20,
    defaultSize: 'medium',
    component: WeeklyProgressWidget,
    capabilities: {
      refreshable: true,
      collapsible: false,
      editable: false,
      offline: true,
      requiresAuth: true,
      supportsTheme: true,
      supportsAnimation: true,
    },
    featureFlags: [],
    permissions: [],
    minimumAppVersion: '1.0.0',
  });

  appWidgetRegistry.register({
    id: 'quick-actions-widget',
    titleKey: 'dashboard.widgets.quickActions.title',
    descriptionKey: 'dashboard.widgets.quickActions.description',
    emptyStateKey: 'dashboard.widgets.quickActions.empty.title',
    accessibilityKey: 'dashboard.widgets.quickActions.a11y',
    iconToken: 'zap',
    category: 'actions',
    priority: 30,
    defaultSize: 'small',
    component: QuickActionsWidget,
    capabilities: {
      refreshable: false,
      collapsible: false,
      editable: false,
      offline: true,
      requiresAuth: true,
      supportsTheme: true,
      supportsAnimation: true,
    },
    featureFlags: [],
    permissions: [],
    minimumAppVersion: '1.0.0',
  });
}
