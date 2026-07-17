import React from 'react';
import { ErrorState } from '@commitment/design-system';
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
      return <ErrorState title={errorMessage ? { text: errorMessage } : { i18nKey: 'dashboard.error.description' }} />;

    case DashboardState.Ready:
    default:
      return <>{children}</>;
  }
}
