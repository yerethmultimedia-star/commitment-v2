import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { useScreenAnnouncement } from '../accessibility/index.js';
import { ScreenScroll } from '../scroll/ScreenScroll.js';
import { StaticScreen } from './StaticScreen.js';
import { View } from 'tamagui';
import { KeyboardProvider } from '../keyboard/KeyboardContext.js';

export interface AppScreenProps {
  scrollable?: boolean;
  keyboardAware?: boolean;
  refreshControl?: { refreshing: boolean; onRefresh: () => void };
  safeArea?: boolean;
  announceOnFocus?: string;
  statusBar?: 'light' | 'dark' | 'auto' | 'hidden';
  testID?: string;
  /** Extra bottom padding for scrollable content — see ScreenScrollProps.contentBottomInset. No-op when scrollable is false. */
  contentBottomInset?: number;
  children?: React.ReactNode;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  scrollable = true,
  keyboardAware = true,
  refreshControl,
  safeArea = true,
  announceOnFocus,
  statusBar = 'auto',
  testID,
  contentBottomInset,
  children,
}) => {
  const { announce } = useScreenAnnouncement();

  useEffect(() => {
    if (!announceOnFocus) return;
    // Small timeout to let screen readers settle
    const timer = setTimeout(() => {
      announce(announceOnFocus);
    }, 300);
    return () => clearTimeout(timer);
  }, [announceOnFocus, announce]);

  let statusBarStyle: 'default' | 'light-content' | 'dark-content' = 'default';
  let statusBarHidden = false;

  if (statusBar === 'light') {
    statusBarStyle = 'light-content';
  } else if (statusBar === 'dark') {
    statusBarStyle = 'dark-content';
  } else if (statusBar === 'hidden') {
    statusBarHidden = true;
  }

  const screenContent = scrollable ? (
    <ScreenScroll
      keyboardAware={keyboardAware}
      safeArea={safeArea}
      refreshing={refreshControl?.refreshing}
      onRefresh={refreshControl?.onRefresh}
      testID={testID}
      contentBottomInset={contentBottomInset}
    >
      {children}
    </ScreenScroll>
  ) : (
    <StaticScreen
      keyboardAware={keyboardAware}
      safeArea={safeArea}
      testID={testID}
    >
      {children}
    </StaticScreen>
  );

  return (
    <KeyboardProvider>
      {/* backgroundColor lives here, not on each consumer's own top-level
          wrapper, because ScreenScroll's contentContainerStyle is
          flexGrow:1 (fills at least the viewport) but a consumer's own
          YStack only ever sizes to its own content — on a screen shorter
          than the viewport, the gap below that YStack showed whatever
          this container defaulted to (nothing), not the theme's
          background. Found live 2026-07-16 auditing Insights' Focus
          detail screen under Midnight. Consumers still set their own
          $background too (harmless, same token) — that's what makes tall
          screens look correct without waiting on this fix. */}
      <View style={styles.container} backgroundColor="$background">
        <StatusBar barStyle={statusBarStyle} hidden={statusBarHidden} />
        {screenContent}
      </View>
    </KeyboardProvider>
  );
};

AppScreen.displayName = 'AppScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
