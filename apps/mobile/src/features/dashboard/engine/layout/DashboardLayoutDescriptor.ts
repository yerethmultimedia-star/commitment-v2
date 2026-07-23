/**
 * DashboardLayoutDescriptor
 *
 * The output contract of the DashboardLayoutEngine (schemaVersion 2).
 *
 * This is a pure data model — no React, no UI imports.
 * The DashboardRenderer maps sections to actual widget components.
 *
 * schemaVersion 2 introduces:
 *   - Explicit hero descriptor with candidates + dismissible
 *   - Sectioned layout (primaryWidgets, secondaryWidgets, footerWidgets)
 *   - quickSummary section
 */

export const LAYOUT_SCHEMA_VERSION = 3 as const;

// ---------------------------------------------------------------------------
// Hero Card
// ---------------------------------------------------------------------------

/**
 * Two hero "kinds" share one descriptor shape (fields optional per kind)
 * rather than a strict discriminated union, so existing i18n-key-based
 * fields stay directly accessible without a `kind` narrowing check at every
 * call site — `DashboardHeroCard.tsx` is the one place that actually
 * branches on `kind`.
 *
 * - 'generic': the original recommendation-driven hero (default/dailyFocus/
 *   weeklyMomentum) — i18n-templated, no real user data.
 * - 'priorityTask': today's single highest-scoring task + a resolved
 *   context label (Goal/Commitment/generic fallback) and, when
 *   commitment-linked, its progress — takes precedence over 'generic'
 *   whenever DashboardContext.priorityTask is non-null (see resolveHero()).
 */
export interface HeroCardDescriptor {
  readonly kind: 'generic' | 'priorityTask';

  // --- 'generic' fields ---
  /** i18n key for the hero title */
  readonly titleKey?: string;
  /** Optional i18n interpolation params */
  readonly titleParams?: Readonly<Record<string, unknown>>;
  readonly subtitleKey?: string;
  readonly subtitleParams?: Readonly<Record<string, unknown>>;
  /** Visual token (emoji or illustration token) */
  readonly illustration?: string;
  /** Visual theme variant */
  readonly themeVariant?: 'gradient' | 'accent' | 'success';
  /** ISO string; hero should not render after this time */
  readonly validUntil?: string;
  /** User can dismiss this hero card */
  readonly dismissible?: boolean;

  // --- 'priorityTask' fields ---
  readonly taskTitle?: string;
  /** Always present for this kind — resolved Goal title, Commitment title, or a generic fallback. */
  readonly contextLabel?: string;
  readonly priority?: 'high' | 'medium' | 'low';
  /** 0..1 — the parent commitment's overall progress. Only present when commitment-linked. */
  readonly progressRatio?: number;

  /** Route to push when the hero is tapped — always present, both kinds. */
  readonly actionRoute: string;
}

// ---------------------------------------------------------------------------
// Widget sections
// ---------------------------------------------------------------------------

export interface LayoutWidgetSlot {
  readonly widgetId: string;
  readonly size: 'small' | 'medium' | 'large';
}

export interface QuickSummaryDescriptor {
  readonly activeCommitmentsCount: number;
  readonly pendingTasksCount: number;
  readonly currentStreakDays: number;
}

// ---------------------------------------------------------------------------
// Full layout contract
// ---------------------------------------------------------------------------

export interface DashboardLayoutDescriptor {
  readonly schemaVersion: typeof LAYOUT_SCHEMA_VERSION;
  /** Active hero card to display at the top */
  readonly hero: HeroCardDescriptor;
  /** Compact summary row below the hero */
  readonly quickSummary: QuickSummaryDescriptor;
  /** Main widgets, displayed in order */
  readonly primaryWidgets: readonly LayoutWidgetSlot[];
  /** Secondary / lower-priority widgets */
  readonly secondaryWidgets: readonly LayoutWidgetSlot[];
  /** Footer widgets (e.g. motivation, activity log) */
  readonly footerWidgets: readonly LayoutWidgetSlot[];
}
