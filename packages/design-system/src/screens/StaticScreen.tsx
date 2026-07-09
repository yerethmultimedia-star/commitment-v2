import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { View, ViewProps } from 'tamagui';
import { SafeArea } from '../layout/SafeArea.js';

export interface StaticScreenProps extends ViewProps {
  safeArea?: boolean;
  keyboardAware?: boolean;
  children?: React.ReactNode;
}

export const StaticScreen = React.forwardRef<any, StaticScreenProps>(({
  safeArea = true,
  keyboardAware = true,
  children,
  ...props
}, ref) => {
  const content = (
    <View ref={ref} style={styles.content} {...props}>
      {children}
    </View>
  );

  const keyboardElement = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (safeArea) {
    return (
      <SafeArea edges={['top', 'bottom']} style={styles.container}>
        {keyboardElement}
      </SafeArea>
    );
  }

  return <View style={styles.container}>{keyboardElement}</View>;
});

StaticScreen.displayName = 'StaticScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
});
