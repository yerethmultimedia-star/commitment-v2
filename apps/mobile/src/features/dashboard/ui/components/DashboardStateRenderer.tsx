import React from 'react';
import { YStack, Text } from 'tamagui';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { DashboardEmptyState } from './empty-states/DashboardEmptyState';

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
  switch (state) {
    case DashboardState.Loading:
      return <DashboardSkeleton />;
      
    case DashboardState.Empty:
      return <DashboardEmptyState />;
      
    case DashboardState.Error:
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$danger" fontSize="$5" fontWeight="600" textAlign="center">
            {errorMessage || 'Ha ocurrido un error al cargar el dashboard.'}
          </Text>
        </YStack>
      );
      
    case DashboardState.Ready:
    default:
      return <>{children}</>;
  }
}
