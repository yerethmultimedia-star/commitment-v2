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

export const LAYOUT_SCHEMA_VERSION = 2 as const;

// ---------------------------------------------------------------------------
// Hero Card
// ---------------------------------------------------------------------------

export interface HeroCardDescriptor {
  /** i18n key for the hero title */
  readonly titleKey: string;
  /** Optional i18n interpolation params */
  readonly titleParams?: Readonly<Record<string, unknown>>;
  readonly subtitleKey: string;
  readonly subtitleParams?: Readonly<Record<string, unknown>>;
  /** Visual token (emoji or illustration token) */
  readonly illustration: string;
  /** Route to push when the hero is tapped */
  readonly actionRoute: string;
  /** Visual theme variant */
  readonly themeVariant: 'gradient' | 'accent' | 'success';
  /** ISO string; hero should not render after this time */
  readonly validUntil?: string;
  /** User can dismiss this hero card */
  readonly dismissible: boolean;
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
