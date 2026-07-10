import { useEffect, useRef } from 'react';
import { FocusManager } from './FocusManager.js';

let nextHookId = 0;

export const useFocusRing = () => {
  return {};
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
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    idRef.current = `focus-trap-${nextHookId++}`;
  }

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const id = idRef.current!;

    FocusManager.pushContext(id, 'dialog', {
      trapContainerRef: containerRef,
      isFocusTrapActive: true,
    });

    return () => {
      FocusManager.popContext(id);
    };
  }, [containerRef, active]);
};
