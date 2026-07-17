import React from 'react';
import { FeedbackState, FeedbackText, FeedbackSpacing } from './FeedbackState.js';

/**
 * An illustration/icon + title + optional description + optional action —
 * for "nothing here yet" states (no Goals, no Habits due today, no search
 * results). See FeedbackState.tsx for the shared implementation; this file
 * only fixes fullscreen=true and tone='neutral' as EmptyState's defaults.
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title?: FeedbackText;
  description?: FeedbackText;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  spacing?: FeedbackSpacing;
  fullscreen?: boolean;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

export const EmptyState = React.forwardRef<any, EmptyStateProps>(({ fullscreen = true, ...props }, ref) => (
  <FeedbackState ref={ref as any} fullscreen={fullscreen} {...props} />
));

EmptyState.displayName = 'EmptyState';
