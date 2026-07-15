import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import GorhomBottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View, useTheme } from 'tamagui';
import { FocusManager } from '../focus/FocusManager.js';

export interface BottomSheetAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const BottomSheetAdapter: React.FC<BottomSheetAdapterProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const initialFocusRef = useRef<any>(null);

  // @gorhom/bottom-sheet renders outside the Tamagui tree (its own native
  // Animated views), so it can't resolve "$surface"-style token strings —
  // those only work inside components Tamagui itself styles. useTheme()
  // reads the currently active theme's resolved values so this sheet follows
  // theme changes instead of being hardcoded to light-mode colors.
  const theme = useTheme();
  const dynamicStyles = useMemo(
    () => ({
      background: { backgroundColor: theme.surface?.get() ?? theme.background?.get() },
      indicator: { backgroundColor: theme.divider?.get() ?? theme.borderColor?.get() },
    }),
    [theme]
  );

  useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const id = `bottomsheet-${Math.random().toString(36).substring(2, 9)}`;
    FocusManager.pushContext(
      id,
      'bottomSheet',
      {
        initialFocusRef,
        onEscape: () => onOpenChange(false),
        onBack: () => onOpenChange(false),
        announceOnFocus: 'Bottom sheet opened',
      },
      8 // Prioridad ligeramente inferior a los diálogos, pero superior a pantallas estándar
    );

    return () => {
      FocusManager.popContext(id);
    };
  }, [open, onOpenChange]);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onOpenChange(false);
    }
  };

  return (
    <GorhomBottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={['60%']}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backgroundStyle={[styles.background, dynamicStyles.background]}
      handleIndicatorStyle={[styles.indicator, dynamicStyles.indicator]}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View ref={initialFocusRef} style={styles.focusAnchor} />
        <View backgroundColor="$surface" flex={1}>
          {children}
        </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  // Fallback only — overridden by dynamicStyles (theme.surface / theme.divider)
  // above. Kept in case useTheme() can't resolve before first paint.
  background: {
    backgroundColor: '#ffffff',
  },
  indicator: {
    backgroundColor: '#cccccc',
  },
  focusAnchor: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});
