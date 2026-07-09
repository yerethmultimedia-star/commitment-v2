import React from 'react';
import { ScrollView, RefreshControl, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { View, ViewProps } from 'tamagui';
import { SafeArea } from '../layout/SafeArea.js';

export interface ScreenScrollProps extends ViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAware?: boolean;
  safeArea?: boolean;
  children?: React.ReactNode;
}

export const ScreenScroll = React.forwardRef<any, ScreenScrollProps>(({
  refreshing = false,
  onRefresh,
  keyboardAware = true,
  safeArea = true,
  children,
  ...props
}, ref) => {
  const scrollElement = (
    <ScrollView
      ref={ref as any}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );

  const keyboardElement = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {scrollElement}
    </KeyboardAvoidingView>
  ) : (
    scrollElement
  );

  if (safeArea) {
    return (
      <SafeArea edges={['top', 'bottom']} style={styles.container}>
        <View style={styles.container} {...props}>
          {keyboardElement}
        </View>
      </SafeArea>
    );
  }

  return (
    <View style={styles.container} {...props}>
      {keyboardElement}
    </View>
  );
});

ScreenScroll.displayName = 'ScreenScroll';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
});
