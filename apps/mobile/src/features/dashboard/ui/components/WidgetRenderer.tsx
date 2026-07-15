import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Text, YStack } from 'tamagui';
import { WidgetDefinition } from '../../registry/WidgetRegistry';

export interface WidgetRendererProps {
  widget: WidgetDefinition;
}

import type { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

const WidgetErrorFallback = ({ error }: FallbackProps) => {
  const { t } = useTranslation();
  return (
    <YStack padding="$4" backgroundColor="$danger" borderRadius="$4" opacity={0.8}>
      <Text color="$contentOnSemantic" fontWeight="bold" accessibilityRole="header">{t('dashboard.error.title')}</Text>
      <Text color="$contentOnSemantic" fontSize="$2">{t('dashboard.error.description')}: {error instanceof Error ? error.message : String(error)}</Text>
    </YStack>
  );
};

const WidgetSuspenseFallback = () => {
  const { t } = useTranslation();
  return (
    <YStack padding="$4" backgroundColor="$surface" borderRadius="$4" minHeight={100} justifyContent="center" alignItems="center">
      <Text color="$contentSecondary">{t('dashboard.loading')}</Text>
    </YStack>
  );
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const Component = widget.component;
  
  return (
    <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
      <Suspense fallback={<WidgetSuspenseFallback />}>
        {/* We can inject global analytics, feature flags or auth checks here later */}
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};
