import { useRef, useCallback } from 'react';
import { Platform, findNodeHandle, TextInput } from 'react-native';

export interface UseFormNavigationConfig {
  scrollViewRef?: React.RefObject<any>;
}

export const useFormNavigation = (config?: UseFormNavigationConfig) => {
  const fields = useRef<{ [key: string]: any }>({});
  const scrollViewRef = config?.scrollViewRef;

  const registerField = useCallback((name: string, ref: any) => {
    if (ref) {
      fields.current[name] = ref;
    } else {
      delete fields.current[name];
    }
  }, []);

  const getFieldRef = useCallback((fieldOrName: string | any) => {
    if (typeof fieldOrName === 'string') {
      return fields.current[fieldOrName];
    }
    return fieldOrName;
  }, []);

  const focusField = useCallback((fieldOrName: string | any) => {
    const field = getFieldRef(fieldOrName);
    if (field) {
      if (typeof field.focus === 'function') {
        field.focus();
      } else if (field.current && typeof field.current.focus === 'function') {
        field.current.focus();
      }
    }
  }, [getFieldRef]);

  const blurField = useCallback((fieldOrName?: string | any) => {
    if (fieldOrName === undefined) {
      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
          (document.activeElement as HTMLElement)?.blur();
        }
      } else {
        const activeInput = TextInput.State.currentlyFocusedInput();
        if (activeInput) {
          activeInput.blur();
        }
      }
      return;
    }

    const field = getFieldRef(fieldOrName);
    if (field) {
      if (typeof field.blur === 'function') {
        field.blur();
      } else if (field.current && typeof field.current.blur === 'function') {
        field.current.blur();
      }
    }
  }, [getFieldRef]);

  const blurCurrentField = useCallback((currentFieldOrName?: string | any) => {
    blurField(currentFieldOrName);
  }, [blurField]);

  const submitCurrentField = useCallback((currentFieldOrName?: string | any, onSubmit?: () => void) => {
    blurField(currentFieldOrName);
    if (onSubmit) {
      onSubmit();
    }
  }, [blurField]);

  const focusNextField = useCallback((order: string[], currentName: string, onSubmit?: () => void) => {
    const currentIndex = order.indexOf(currentName);
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
      const nextName = order[currentIndex + 1];
      if (nextName) {
        focusField(nextName);
      }
    } else if (onSubmit) {
      onSubmit();
    }
  }, [focusField]);

  const focusPreviousField = useCallback((order: string[], currentName: string) => {
    const currentIndex = order.indexOf(currentName);
    if (currentIndex > 0) {
      const prevName = order[currentIndex - 1];
      if (prevName) {
        focusField(prevName);
      }
    }
  }, [focusField]);

  const focusFirstErrorField = useCallback((order: string[], errors: Record<string, any>) => {
    const errorField = order.find((name) => errors[name]);
    if (errorField) {
      focusField(errorField);
      return errorField;
    }
    return null;
  }, [focusField]);

  const scrollToField = useCallback((fieldOrName: string | any) => {
    const field = getFieldRef(fieldOrName);
    if (!field || !scrollViewRef?.current) return;

    if (Platform.OS === 'web') {
      const node = field.current || field;
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      const scrollNode = scrollViewRef.current;
      const targetNode = field.current || field;
      
      if (targetNode && typeof targetNode.measureLayout === 'function') {
        const scrollHandle = findNodeHandle(scrollNode);
        if (scrollHandle) {
          targetNode.measureLayout(
            scrollHandle,
            (_x: number, y: number) => {
              scrollNode.scrollTo({ y: Math.max(0, y - 40), animated: true });
            },
            () => {
              if (typeof targetNode.measure === 'function') {
                targetNode.measure((_x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
                  scrollNode.scrollTo({ y: Math.max(0, py - 40), animated: true });
                });
              }
            }
          );
        }
      }
    }
  }, [scrollViewRef, getFieldRef]);

  const ensureVisible = useCallback((fieldOrName: string | any) => {
    scrollToField(fieldOrName);
  }, [scrollToField]);

  return {
    registerField,
    focusField,
    blurField,
    blurCurrentField,
    submitCurrentField,
    focusNextField,
    focusPreviousField,
    focusFirstErrorField,
    scrollToField,
    ensureVisible,
  };
};
