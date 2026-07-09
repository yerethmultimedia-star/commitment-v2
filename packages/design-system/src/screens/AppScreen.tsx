import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { useScreenAnnouncement } from '../focus/index.js';
import { ScreenScroll } from '../scroll/ScreenScroll.js';
import { StaticScreen } from './StaticScreen.js';
import { View } from 'tamagui';

export interface AppScreenProps {
  scrollable?: boolean;
  keyboardAware?: boolean;
  refreshControl?: { refreshing: boolean; onRefresh: () => void };
  safeArea?: boolean;
  announceOnFocus?: string;
  statusBar?: 'light' | 'dark' | 'auto' | 'hidden';
  testID?: string;
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
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} hidden={statusBarHidden} />
      {screenContent}
    </View>
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
