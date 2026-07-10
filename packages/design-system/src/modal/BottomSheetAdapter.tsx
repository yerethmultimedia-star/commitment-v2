import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import GorhomBottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View } from 'tamagui';
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
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
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
  background: {
    backgroundColor: '#ffffff', // matches $surface in default light mode
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
