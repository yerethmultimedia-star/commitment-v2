import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeResolver, ResolvedAppearance } from '@commitment/theme-engine';
import { useAppearanceStore } from '../store/use-appearance-store';
import { appThemeRegistry } from './theme-registry';
import { Theme } from 'tamagui';
import ViewShot from 'react-native-view-shot';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import i18n from '@/core/i18n';

const themeResolver = new ThemeResolver(appThemeRegistry, 'DefaultLight');
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
  const viewShotRef = useRef<any>(null);
  
  // Transition state
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const opacity = useSharedValue(0);
  
  // Keep track of the active appearance that is actually rendered.
  // We only update this *after* taking a snapshot when a change occurs.
  const [activeAppearance, setActiveAppearance] = useState<typeof appearance>(null);

  useEffect(() => {
    load(userId);
  }, [userId, load]);

  useEffect(() => {
    if (!appearance) return;

    if (!activeAppearance) {
      // First load, just set it
      setActiveAppearance(appearance);
      return;
    }

    if (appearance.settings.themeId !== activeAppearance.settings.themeId) {
      // Theme changed! Capture snapshot if motion is allowed
      if (!appearance.settings.reducedMotion && viewShotRef.current?.capture) {
        viewShotRef.current.capture().then((uri: string) => {
          setSnapshotUri(uri);
          opacity.value = 1;
          
          // Now apply the new theme
          setActiveAppearance(appearance);
          
          // Crossfade: 200ms
          opacity.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(setSnapshotUri)(null);
            }
          });
        }).catch(() => {
          // Fallback if capture fails
          setActiveAppearance(appearance);
        });
      } else {
        // Reduced motion: switch instantly without snapshot
        setActiveAppearance(appearance);
      }
    } else {
      // Just other settings changed, apply immediately
      setActiveAppearance(appearance);
    }
  }, [appearance, activeAppearance, opacity]);

  // The one real wiring point for AppearanceSettings.locale — the field
  // already existed on the domain model and was already persisted by
  // updateSettings(), but nothing ever called i18next to actually switch
  // language until now.
  useEffect(() => {
    const locale = activeAppearance?.settings.locale;
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [activeAppearance?.settings.locale]);

  const resolvedAppearance = useMemo(() => {
    if (!activeAppearance) return null;
    return themeResolver.resolve({
      themeId: activeAppearance.settings.themeId,
      locale: activeAppearance.settings.locale,
      reducedMotion: activeAppearance.settings.reducedMotion,
      highContrast: activeAppearance.settings.highContrast,
    });
  }, [activeAppearance]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (isLoading || !resolvedAppearance || !activeAppearance) {
    return null;
  }

  return (
    <AppearanceContext.Provider value={resolvedAppearance}>
      <Theme name={activeAppearance.settings.themeId as any}>
        <View style={styles.container}>
          <ViewShot ref={viewShotRef} style={styles.container} options={{ format: 'jpg', quality: 0.8 }}>
            {children}
          </ViewShot>
          
          {snapshotUri && (
            <Animated.View style={[styles.overlay, animatedOverlayStyle] as any} pointerEvents="none">
              <Animated.Image 
                source={{ uri: snapshotUri }} 
                style={StyleSheet.absoluteFill as any} 
              />
            </Animated.View>
          )}
        </View>
      </Theme>
    </AppearanceContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill as any,
  }
});
