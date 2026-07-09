import { useEffect, useRef } from 'react';
import { FocusManager } from './FocusManager.js';
import { Platform } from 'react-native';
import { announce } from '../accessibility/AccessibilityAnnouncer.js';

let nextHookId = 0;

export const useFocusRing = () => {
  return {};
};

export const useScreenAnnouncement = () => {
  const announceFunc = (message: string) => {
    announce.screen(message);
  };
  return { announce: announceFunc };
};

export const useInitialFocus = (ref: React.RefObject<any>, active: boolean = true) => {
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    idRef.current = `initial-focus-${nextHookId++}`;
  }

  useEffect(() => {
    if (!active || !ref.current) return;
    const id = idRef.current!;

    FocusManager.pushContext(id, 'screen', {
      initialFocusRef: ref,
    });

    return () => {
      FocusManager.popContext(id);
    };
  }, [ref, active]);
};

export const useRestoreFocus = (ref: React.RefObject<any>, active: boolean = true) => {
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    idRef.current = `restore-focus-${nextHookId++}`;
  }

  useEffect(() => {
    if (!active || !ref.current) return;
    const id = idRef.current!;

    FocusManager.pushContext(id, 'screen', {
      restoreFocusRef: ref,
    });

    return () => {
      FocusManager.popContext(id);
    };
  }, [ref, active]);
};

export const useFocusTrap = (containerRef: React.RefObject<any>, active: boolean = true) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !active || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      const focusableSelectors = [
        'a[href]',
        'area[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'iframe',
        'object',
        'embed',
        '[contenteditable]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      const focusableElements = Array.from(
        container.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, active]);
};
