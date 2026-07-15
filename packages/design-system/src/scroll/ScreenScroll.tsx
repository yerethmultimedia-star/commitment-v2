import React, { useRef, useEffect } from 'react';
import { ScrollView, RefreshControl, KeyboardAvoidingView, Platform, StyleSheet, TextInput, findNodeHandle } from 'react-native';
import { View, ViewProps } from 'tamagui';
import { SafeArea } from '../layout/SafeArea.js';
import { useKeyboard } from '../keyboard/KeyboardContext.js';

export interface ScreenScrollProps extends ViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAware?: boolean;
  safeArea?: boolean;
  /** Extra bottom padding on top of the default content padding — for content that would otherwise sit behind an app-level floating overlay (e.g. a floating tab bar) that isn't part of normal layout flow. */
  contentBottomInset?: number;
  children?: React.ReactNode;
}

export const ScreenScroll = React.forwardRef<any, ScreenScrollProps>(({
  refreshing = false,
  onRefresh,
  keyboardAware = true,
  safeArea = true,
  contentBottomInset = 0,
  children,
  ...props
}, ref) => {
  const localScrollRef = useRef<ScrollView>(null);
  const scrollRef = (ref as React.RefObject<ScrollView>) || localScrollRef;
  const { keyboardVisible } = useKeyboard();

  useEffect(() => {
    if (!keyboardVisible || !keyboardAware || !scrollRef.current) return;

    const timer = setTimeout(() => {
      try {
        const currentlyFocused = TextInput.State.currentlyFocusedInput();
        const scrollNode = scrollRef.current;
        if (currentlyFocused && scrollNode) {
          const scrollHandle = findNodeHandle(scrollNode);
          if (scrollHandle) {
            currentlyFocused.measureLayout(
              scrollHandle,
              (_x: number, y: number) => {
                scrollNode.scrollTo({ y: Math.max(0, y - 40), animated: true });
              },
              () => {
                // Fallback si falla measureLayout
                if (typeof (currentlyFocused as any).measure === 'function') {
                  (currentlyFocused as any).measure((_x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
                    scrollNode.scrollTo({ y: Math.max(0, py - 40), animated: true });
                  });
                }
              }
            );
          }
        }
      } catch (err) {
        console.warn('Error measuring focused input for ScreenScroll auto-scroll:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [keyboardVisible, keyboardAware, scrollRef]);

  const scrollElement = (
    <ScrollView
      ref={scrollRef as any}
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentBottomInset > 0 && { paddingBottom: 16 + contentBottomInset }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
