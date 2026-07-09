import { useRef, useEffect, RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export const useFocusRing = () => {
  // Focus rings are generally handled natively or by Tamagui for Web/Keyboard.
  // We expose this hook in case we need custom manual tracking of focus state later.
  return {};
};

/**
 * Automatically focuses the attached element when the component mounts.
 * Useful for Screen Readers to immediately read the most important element (e.g. a title or first input).
 */
export const useInitialFocus = <T extends any>(): RefObject<T | null> => {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (ref.current) {
      const node = findNodeHandle(ref.current as any);
      if (node) {
        // We use a small timeout to ensure the layout is painted before focusing
        setTimeout(() => {
          AccessibilityInfo.setAccessibilityFocus(node);
        }, 100);
      }
    }
  }, []);
  
  return ref;
};

/**
 * Remembers a ref and provides a method to restore accessibility focus to it.
 * Useful when closing a modal or a bottom sheet to return focus to the trigger button.
 */
export const useRestoreFocus = <T extends any>() => {
  const ref = useRef<T>(null);
  
  const restoreFocus = () => {
    if (ref.current) {
      const node = findNodeHandle(ref.current as any);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
  };
  
  return { ref, restoreFocus };
};

/**
 * Triggers an immediate screen reader announcement.
 */
export const useScreenAnnouncement = () => {
  const announce = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };
  
  return { announce };
};

/**
 * Traps focus within a specific element (useful for Modals, BottomSheets).
 * Note: Tamagui's Dialog and Sheet usually handle this natively, but we expose it for custom overlays.
 */
export const useFocusTrap = <T extends any>() => {
  const ref = useRef<T>(null);
  
  // Basic implementation scaffold.
  // Full focus trapping in React Native often relies on specific Modal components.
  // On Web, this would add event listeners for the Tab key.
  
  return ref;
};
