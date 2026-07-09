import React from 'react';
import { Platform } from 'react-native';
import { ModalPrimitive } from './ModalPrimitive.js';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = (props) => {
  if (Platform.OS === 'web') {
    return <ModalPrimitive centered={false} {...props} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { BottomSheetAdapter } = require('./BottomSheetAdapter.js');
  return <BottomSheetAdapter {...props} />;
};

BottomSheet.displayName = 'BottomSheet';
