import { appWidgetRegistry } from './WidgetRegistry';
import { TodayWidget } from '../ui/components/widgets/TodayWidget';
import { WeeklyProgressWidget } from '../ui/components/widgets/WeeklyProgressWidget';
import { QuickActionsWidget } from '../ui/components/widgets/QuickActionsWidget';
import { UpcomingTasksWidget } from '../ui/components/widgets/UpcomingTasksWidget';
import { CompletionRateWidget } from '../ui/components/widgets/CompletionRateWidget';
import { RecentActivityWidget } from '../ui/components/widgets/RecentActivityWidget';
import { CurrentStreakWidget } from '../ui/components/widgets/CurrentStreakWidget';
import { MotivationWidget } from '../ui/components/widgets/MotivationWidget';
import { TodayHabitsWidget } from '../ui/components/widgets/TodayHabitsWidget';
import { TodayAgendaWidget } from '../ui/components/widgets/TodayAgendaWidget';
import { CoachMessageWidget } from '../ui/components/widgets/CoachMessageWidget';

export function registerDefaultWidgets() {
  appWidgetRegistry.register({
    id: 'coach-message-widget',
    titleKey: 'dashboard.widgets.coachMessage.label',
    accessibilityKey: 'dashboard.widgets.coachMessage.label',
    iconToken: 'bot',
    category: 'motivation',
    priority: 14,
    defaultSize: 'medium',
    component: CoachMessageWidget,
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
    id: 'today-habits-widget',
    titleKey: 'dashboard.widgets.todayHabits.title',
    emptyStateKey: 'dashboard.widgets.todayHabits.empty.title',
    accessibilityKey: 'dashboard.widgets.todayHabits.itemA11y',
    iconToken: 'check-circle',
    category: 'activity',
    priority: 12,
    defaultSize: 'medium',
    component: TodayHabitsWidget,
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
    id: 'today-agenda-widget',
    titleKey: 'dashboard.widgets.todayAgenda.title',
    emptyStateKey: 'dashboard.widgets.todayAgenda.empty.title',
    accessibilityKey: 'dashboard.widgets.todayAgenda.a11y',
    iconToken: 'calendar',
    category: 'activity',
    priority: 13,
    defaultSize: 'medium',
    component: TodayAgendaWidget,
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
    id: 'upcoming-tasks-widget',
    titleKey: 'dashboard.widgets.upcoming.title',
    iconToken: 'calendar', category: 'activity', priority: 15, defaultSize: 'medium', component: UpcomingTasksWidget,
    capabilities: { refreshable: true, collapsible: false, editable: false, offline: true, requiresAuth: true, supportsTheme: true, supportsAnimation: true },
    featureFlags: [], permissions: [], minimumAppVersion: '1.0.0',
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
    supportsPersonalization: true,
    minimumSize: 'medium',
    preferredPosition: 3,
    requiresData: true,
    dependencies: ['DashboardProjection'],
    supportsOffline: true,
  });

  appWidgetRegistry.register({
    id: 'completion-rate-widget',
    titleKey: 'dashboard.widgets.completionRate.title',
    iconToken: 'chart', category: 'progress', priority: 25, defaultSize: 'small', component: CompletionRateWidget,
    capabilities: { refreshable: true, collapsible: false, editable: false, offline: true, requiresAuth: true, supportsTheme: true, supportsAnimation: true },
    featureFlags: [], permissions: [], minimumAppVersion: '1.0.0',
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

  appWidgetRegistry.register({
    id: 'current-streak-widget',
    titleKey: 'dashboard.widgets.currentStreak.title',
    iconToken: 'flame',
    category: 'gamification',
    priority: 8,
    defaultSize: 'small',
    component: CurrentStreakWidget,
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
    id: 'recent-activity-widget',
    titleKey: 'dashboard.widgets.recentActivity.title',
    iconToken: 'history',
    category: 'activity',
    priority: 35,
    defaultSize: 'medium',
    component: RecentActivityWidget,
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
    id: 'motivation-widget',
    titleKey: 'dashboard.widgets.motivation.title',
    iconToken: 'award',
    category: 'motivation',
    priority: 40,
    defaultSize: 'medium',
    component: MotivationWidget,
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
