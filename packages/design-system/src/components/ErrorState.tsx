import React from 'react';
import { FeedbackState, FeedbackText, FeedbackSpacing } from './FeedbackState.js';

/**
 * Same shell as EmptyState, specialized for error states: title defaults to
 * the 'danger' tone, and the common case (a retry button as primaryAction)
 * is the expected usage, though not enforced — some errors are genuinely
 * not retryable.
 */
export interface ErrorStateProps {
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

export const ErrorState = React.forwardRef<any, ErrorStateProps>(({ fullscreen = true, ...props }, ref) => (
  <FeedbackState ref={ref as any} fullscreen={fullscreen} tone="danger" {...props} />
));

ErrorState.displayName = 'ErrorState';
