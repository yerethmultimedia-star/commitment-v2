import React from 'react';
import { Spinner } from 'tamagui';
import { FeedbackState, FeedbackText, FeedbackSpacing } from './FeedbackState.js';

/**
 * A centered spinner, optionally with a title/description (e.g. "Cargando
 * tus datos..."). Always shows a Spinner as the icon slot unless a custom
 * `icon` is explicitly passed — LoadingState's whole reason to exist over
 * bare FeedbackState is not having to remember to pass the spinner yourself.
 */
export interface LoadingStateProps {
  icon?: React.ReactNode;
  title?: FeedbackText;
  description?: FeedbackText;
  spacing?: FeedbackSpacing;
  fullscreen?: boolean;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}

export const LoadingState = React.forwardRef<any, LoadingStateProps>(({ icon, fullscreen = true, ...props }, ref) => (
  <FeedbackState ref={ref as any} fullscreen={fullscreen} icon={icon ?? <Spinner size="large" color="$accent" />} {...props} />
));

LoadingState.displayName = 'LoadingState';
