/**
 * DashboardLayoutEngine
 *
 * DETERMINISTIC PURE FUNCTION.
 *
 * Contract:
 *   resolve(context: DashboardContext, recommendations: Recommendation[]) → DashboardLayoutDescriptor
 *
 * MUST NOT:
 *   - Read from Zustand
 *   - Read from React Context
 *   - Perform any I/O or async operation
 *   - Access module-level mutable state
 *
 * In development, assertDeterministicEntry/Exit guards enforce this.
 */

import { DashboardContext, Recommendation } from '@commitment/domain';
import {
  DashboardLayoutDescriptor,
  HeroCardDescriptor,
  LAYOUT_SCHEMA_VERSION,
  LayoutWidgetSlot,
  QuickSummaryDescriptor,
} from './DashboardLayoutDescriptor';
import {
  assertDeterministicEntry,
  assertDeterministicExit,
} from './assertDeterministic';

// ---------------------------------------------------------------------------
// Hero resolution
// ---------------------------------------------------------------------------

const DEFAULT_HERO: HeroCardDescriptor = {
  kind: 'generic',
  titleKey: 'dashboard.hero.default.title',
  subtitleKey: 'dashboard.hero.default.subtitle',
  illustration: '✨',
  actionRoute: '/(tabs)/goals',
  themeVariant: 'gradient',
  dismissible: false,
};

function resolveGenericHero(recommendations: Recommendation[]): HeroCardDescriptor {
  const pinRecs = recommendations
    .filter((r) => r.type === 'PIN_HERO')
    .sort((a, b) => b.priority - a.priority);

  if (pinRecs.length === 0) return DEFAULT_HERO;

  const topPin = pinRecs[0]!;

  if (topPin.targetId === 'daily-focus') {
    return {
      kind: 'generic',
      titleKey: 'dashboard.hero.dailyFocus.title',
      titleParams: { count: topPin.metadata?.count ?? 0 },
      subtitleKey: 'dashboard.hero.dailyFocus.subtitle',
      illustration: '🎯',
      actionRoute: '/(tabs)/today',
      themeVariant: 'accent',
      dismissible: false,
    };
  }

  if (topPin.targetId === 'streak') {
    return {
      kind: 'generic',
      titleKey: 'dashboard.hero.streak.title',
      titleParams: { count: topPin.metadata?.count ?? 0 },
      subtitleKey: 'dashboard.hero.streak.subtitle',
      illustration: '🔥',
      actionRoute: '/(tabs)/insights',
      themeVariant: 'success',
      dismissible: true,
    };
  }

  return DEFAULT_HERO;
}

/**
 * A real "priority of the day" task takes precedence over the generic,
 * i18n-templated heroes whenever one exists — showing something concrete
 * beats a motivational placeholder. Falls back to the recommendation-driven
 * generic hero only when context.priorityTask is null (no pending-today
 * task has a parent commitment to show).
 */
function resolveHero(context: DashboardContext, recommendations: Recommendation[]): HeroCardDescriptor {
  if (context.priorityTask) {
    return {
      kind: 'priorityTask',
      taskTitle: context.priorityTask.title,
      commitmentTitle: context.priorityTask.commitmentTitle,
      priority: context.priorityTask.priority,
      progressRatio: context.priorityTask.commitmentProgressRatio,
      // Opens the task itself in the Tasks tab — neither the Goal Workspace
      // nor the Commitment Workspace screen shows individual Task items, so
      // those routes are dead ends here even though this task belongs to one.
      actionRoute: `/(tabs)/tasks?taskId=${context.priorityTask.taskId}`,
    };
  }

  return resolveGenericHero(recommendations);
}

// ---------------------------------------------------------------------------
// Widget order resolution
// ---------------------------------------------------------------------------

const DEFAULT_WIDGET_ORDER: LayoutWidgetSlot[] = [
  { widgetId: 'current-streak-widget', size: 'small' },
  { widgetId: 'today-widget', size: 'medium' },
  { widgetId: 'today-agenda-widget', size: 'medium' },
  { widgetId: 'today-habits-widget', size: 'medium' },
  { widgetId: 'coach-message-widget', size: 'medium' },
  { widgetId: 'upcoming-tasks-widget', size: 'medium' },
  { widgetId: 'weekly-progress-widget', size: 'medium' },
  { widgetId: 'completion-rate-widget', size: 'small' },
  { widgetId: 'quick-actions-widget', size: 'small' },
  { widgetId: 'recent-activity-widget', size: 'medium' },
  { widgetId: 'motivation-widget', size: 'medium' },
];

const PRIMARY_WIDGET_IDS = new Set([
  'today-widget',
  'today-habits-widget',
  'today-agenda-widget',
  'coach-message-widget',
  'upcoming-tasks-widget',
  'current-streak-widget',
]);

const FOOTER_WIDGET_IDS = new Set([
  'motivation-widget',
  'recent-activity-widget',
]);

function resolveWidgets(
  recommendations: Recommendation[],
): Pick<
  DashboardLayoutDescriptor,
  'primaryWidgets' | 'secondaryWidgets' | 'footerWidgets'
> {
  // Build promoted/demoted maps
  const promotedIds = new Set(
    recommendations
      .filter((r) => r.type === 'PROMOTE_WIDGET')
      .map((r) => r.targetId),
  );
  const hiddenIds = new Set(
    recommendations
      .filter((r) => r.type === 'HIDE_WIDGET')
      .map((r) => r.targetId),
  );

  const visible = DEFAULT_WIDGET_ORDER.filter((w) => !hiddenIds.has(w.widgetId));

  // Apply promotions: move promoted items to front of their section
  const promoted = visible.filter((w) => promotedIds.has(w.widgetId));
  const rest = visible.filter((w) => !promotedIds.has(w.widgetId));
  const ordered = [...promoted, ...rest];

  const primary: LayoutWidgetSlot[] = [];
  const secondary: LayoutWidgetSlot[] = [];
  const footer: LayoutWidgetSlot[] = [];

  for (const slot of ordered) {
    if (FOOTER_WIDGET_IDS.has(slot.widgetId)) {
      footer.push(slot);
    } else if (PRIMARY_WIDGET_IDS.has(slot.widgetId) || promotedIds.has(slot.widgetId)) {
      primary.push(slot);
    } else {
      secondary.push(slot);
    }
  }

  return { primaryWidgets: primary, secondaryWidgets: secondary, footerWidgets: footer };
}

// ---------------------------------------------------------------------------
// Quick summary
// ---------------------------------------------------------------------------

function resolveQuickSummary(context: DashboardContext): QuickSummaryDescriptor {
  return {
    activeCommitmentsCount: context.commitments.totalActive,
    pendingTasksCount: context.tasks.pendingToday,
    currentStreakDays: context.streak.currentStreakDays,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the full dashboard layout descriptor from context + recommendations.
 *
 * This function is deterministic: identical inputs always produce identical outputs.
 */
export function resolve(
  context: DashboardContext,
  recommendations: Recommendation[],
): DashboardLayoutDescriptor {
  assertDeterministicEntry('DashboardLayoutEngine');
  try {
    const hero = resolveHero(context, recommendations);
    const quickSummary = resolveQuickSummary(context);
    const { primaryWidgets, secondaryWidgets, footerWidgets } =
      resolveWidgets(recommendations);

    return {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      hero,
      quickSummary,
      primaryWidgets,
      secondaryWidgets,
      footerWidgets,
    };
  } finally {
    assertDeterministicExit();
  }
}
