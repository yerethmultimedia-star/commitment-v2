import React, { createContext, useContext, useState, useEffect } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

export interface KeyboardState {
  keyboardVisible: boolean;
  keyboardHeight: number;
}

const KeyboardContext = createContext<KeyboardState>({
  keyboardVisible: false,
  keyboardHeight: 0,
});

export const useKeyboardState = () => useContext(KeyboardContext);

export interface KeyboardProviderProps {
  children: React.ReactNode;
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [state, setState] = useState<KeyboardState>({
    keyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setState({
          keyboardVisible: true,
          keyboardHeight: e.endCoordinates.height,
        });
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setState({
          keyboardVisible: false,
          keyboardHeight: 0,
        });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return <KeyboardContext.Provider value={state}>{children}</KeyboardContext.Provider>;
};
