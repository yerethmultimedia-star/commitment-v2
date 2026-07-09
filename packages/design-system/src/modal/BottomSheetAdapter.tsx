import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import GorhomBottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { View } from 'tamagui';

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

  useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

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
    backgroundColor: '#ffffff', // matches $surface in default light mode, theme engine will style it
  },
  indicator: {
    backgroundColor: '#cccccc',
  },
});
