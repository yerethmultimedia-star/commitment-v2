import React from 'react';
import { YStack, Text } from 'tamagui';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { DashboardEmptyState } from './empty-states/DashboardEmptyState';
import { useTranslation } from 'react-i18next';

export enum DashboardState {
  Loading = 'LOADING',
  Empty = 'EMPTY',
  Ready = 'READY',
  Error = 'ERROR',
}

export interface DashboardStateRendererProps {
  state: DashboardState;
  errorMessage?: string;
  children: React.ReactNode;
}

export function DashboardStateRenderer({ state, errorMessage, children }: DashboardStateRendererProps) {
  const { t } = useTranslation('common');
  switch (state) {
    case DashboardState.Loading:
      return <DashboardSkeleton />;
      
    case DashboardState.Empty:
      return <DashboardEmptyState />;
      
    case DashboardState.Error:
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$danger" fontSize="$5" fontWeight="600" textAlign="center">
            {errorMessage || t('dashboard.error.description')}
          </Text>
        </YStack>
      );
      
    case DashboardState.Ready:
    default:
      return <>{children}</>;
  }
}
