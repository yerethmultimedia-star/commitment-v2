import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ThemeResolver, ResolvedAppearance } from '@commitment/theme-engine';
import { useAppearanceStore } from '../store/use-appearance-store';
import { appThemeRegistry } from './theme-registry';

// Create the resolver
const themeResolver = new ThemeResolver(appThemeRegistry, 'Sunrise');

const AppearanceContext = createContext<ResolvedAppearance | null>(null);

export const useResolvedAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useResolvedAppearance must be used within an AppearanceProvider');
  }
  return context;
};

export const AppearanceProvider = ({ children, userId }: { children: React.ReactNode; userId: string }) => {
  const { appearance, isLoading, load } = useAppearanceStore();

  useEffect(() => {
    load(userId);
  }, [userId, load]);

  const resolvedAppearance = useMemo(() => {
    if (!appearance) return null;
    return themeResolver.resolve({
      themeId: appearance.settings.themeId,
      locale: appearance.settings.locale,
      reducedMotion: appearance.settings.reducedMotion,
      highContrast: appearance.settings.highContrast,
    });
  }, [appearance]);

  if (isLoading || !resolvedAppearance) {
    return null; // Or a splash screen fallback
  }

  return (
    <AppearanceContext.Provider value={resolvedAppearance}>
      {children}
    </AppearanceContext.Provider>
  );
};
