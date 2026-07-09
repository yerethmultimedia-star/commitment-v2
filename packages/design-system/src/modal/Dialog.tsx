import React from 'react';
import { ModalPrimitive } from './ModalPrimitive.js';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = (props) => {
  return <ModalPrimitive centered={true} {...props} />;
};

Dialog.displayName = 'Dialog';
