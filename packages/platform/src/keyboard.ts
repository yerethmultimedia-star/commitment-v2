import { Keyboard, Platform, KeyboardEvent } from 'react-native';

export interface KeyboardEventData {
  height: number;
  duration?: number;
  easing?: string;
}

export type KeyboardListenerCallback = (data: KeyboardEventData) => void;

export interface KeyboardPlatformAdapter {
  addListener(event: 'show' | 'hide', callback: KeyboardListenerCallback): () => void;
  dismiss(): void;
}

export class NativeKeyboardAdapter implements KeyboardPlatformAdapter {
  addListener(event: 'show' | 'hide', callback: KeyboardListenerCallback): () => void {
    if (Platform.OS === 'web') {
      return () => {};
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      if (event === 'show') {
        callback({
          height: e.endCoordinates.height,
          duration: e.duration,
          easing: e.easing,
        });
      }
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (e: KeyboardEvent) => {
      if (event === 'hide') {
        callback({
          height: 0,
          duration: e?.duration,
          easing: e?.easing,
        });
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }

  dismiss(): void {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  }
}

export const createKeyboardPlatformAdapter = (): KeyboardPlatformAdapter => new NativeKeyboardAdapter();
