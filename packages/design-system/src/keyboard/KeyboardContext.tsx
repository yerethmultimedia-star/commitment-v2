import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PlatformContext } from '../providers/PlatformProvider.js';

export interface KeyboardState {
  keyboardHeight: number;
  keyboardVisible: boolean;
  animationDuration: number;
  animationCurve: string;
  dismiss: () => void;
}

const KeyboardContext = createContext<KeyboardState>({
  keyboardHeight: 0,
  keyboardVisible: false,
  animationDuration: 0,
  animationCurve: 'none',
  dismiss: () => {},
});

export const useKeyboard = () => useContext(KeyboardContext);

// Alias para compatibilidad hacia atrás
export const useKeyboardState = useKeyboard;

export interface KeyboardProviderProps {
  children: React.ReactNode;
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const platform = useContext(PlatformContext);
  const adapter = platform?.keyboard || {
    addListener: () => () => {},
    dismiss: () => {},
  };

  const [state, setState] = useState({
    keyboardHeight: 0,
    keyboardVisible: false,
    animationDuration: 0,
    animationCurve: 'none',
  });

  useEffect(() => {
    const unsubscribeShow = adapter.addListener('show', (data) => {
      setState({
        keyboardHeight: data.height,
        keyboardVisible: true,
        animationDuration: data.duration ?? 250,
        animationCurve: data.easing ?? 'keyboard',
      });
    });

    const unsubscribeHide = adapter.addListener('hide', (data) => {
      setState({
        keyboardHeight: 0,
        keyboardVisible: false,
        animationDuration: data?.duration ?? 250,
        animationCurve: data?.easing ?? 'keyboard',
      });
    });

    return () => {
      unsubscribeShow();
      unsubscribeHide();
    };
  }, [adapter]);

  const value = useMemo<KeyboardState>(() => ({
    ...state,
    dismiss: () => adapter.dismiss(),
  }), [state, adapter]);

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};
