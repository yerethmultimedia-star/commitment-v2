import React from 'react';
import { View, Platform } from 'react-native';
import { useKeyboard } from './KeyboardContext.js';

export const KeyboardSpacer: React.FC = () => {
  const { keyboardHeight } = useKeyboard();

  if (Platform.OS === 'web') return null;

  return <View style={{ height: keyboardHeight }} />;
};

KeyboardSpacer.displayName = 'KeyboardSpacer';
