import React from 'react';
import { View, Platform } from 'react-native';
import { useKeyboardState } from './KeyboardContext.js';

export const KeyboardSpacer: React.FC = () => {
  const { keyboardHeight } = useKeyboardState();

  if (Platform.OS === 'web') return null;

  return <View style={{ height: keyboardHeight }} />;
};

KeyboardSpacer.displayName = 'KeyboardSpacer';
