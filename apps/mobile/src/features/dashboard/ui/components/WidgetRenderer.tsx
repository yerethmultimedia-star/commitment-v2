import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { YStack } from 'tamagui';
import { Body } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { WidgetDefinition } from '../../registry/WidgetRegistry';

export interface WidgetRendererProps {
  widget: WidgetDefinition;
}

import type { FallbackProps } from 'react-error-boundary';

// This fallback composes a translated label with a raw (non-translatable)
// runtime error message on the same line — genuinely can't be expressed as
// a single declarative i18nKey prop, so it keeps its own t() call rather
// than force an awkward split across two sibling Text nodes.
const WidgetErrorFallback = ({ error }: FallbackProps) => {
  const { t } = useTranslation();
  return (
    <YStack padding="$4" backgroundColor="$danger" borderRadius="$4" opacity={0.8}>
      <Body color="$contentOnSemantic" fontWeight="bold" accessibilityRole="header" i18nKey="dashboard.error.title" />
      <Body color="$contentOnSemantic" fontSize="$2">
        {t('dashboard.error.description')}: {error instanceof Error ? error.message : String(error)}
      </Body>
    </YStack>
  );
};

const WidgetSuspenseFallback = () => {
  return (
    <YStack padding="$4" backgroundColor="$surface" borderRadius="$4" minHeight={100} justifyContent="center" alignItems="center">
      <Body color="$contentSecondary" i18nKey="dashboard.loading" />
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
