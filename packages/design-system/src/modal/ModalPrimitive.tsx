import React, { useEffect, useRef } from 'react';
import { Modal as RNModal, StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import { View, styled } from 'tamagui';
import { Portal } from '../portal/Portal.js';
import { FocusManager } from '../focus/FocusManager.js';

export interface ModalPrimitiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  centered?: boolean;
  children: React.ReactNode;
}

const Backdrop = styled(View, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Calm backdrop desaturation
  justifyContent: 'center',
  alignItems: 'center',
});

export const ModalPrimitive: React.FC<ModalPrimitiveProps> = ({
  open,
  onOpenChange,
  centered = true,
  children,
}) => {
  const containerRef = useRef<any>(null);
  const initialFocusRef = useRef<any>(null);

  useEffect(() => {
    if (!open) return;

    const id = `modal-${Math.random().toString(36).substring(2, 9)}`;
    FocusManager.pushContext(
      id,
      'dialog',
      {
        initialFocusRef,
        trapContainerRef: containerRef,
        isFocusTrapActive: true,
        onEscape: () => onOpenChange(false),
        onBack: () => onOpenChange(false),
        announceOnFocus: 'Dialog opened',
      },
      10 // Mayor prioridad que pantallas estándar
    );

    return () => {
      FocusManager.popContext(id);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const content = (
    <Backdrop onPress={() => onOpenChange(false)}>
      <TouchableWithoutFeedback>
        <View
          ref={containerRef}
          backgroundColor="$surface"
          borderRadius="$4"
          padding="$md"
          maxWidth={Platform.OS === 'web' ? 500 : '90%'}
          width="100%"
          style={centered ? styles.centered : styles.bottom}
          shadowColor="$contentPrimary"
          shadowOpacity={0.1}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 4 }}
          tabIndex={Platform.OS === 'web' ? -1 : undefined}
        >
          <View ref={initialFocusRef} tabIndex={Platform.OS === 'web' ? -1 : undefined} style={styles.focusAnchor} />
          {children}
        </View>
      </TouchableWithoutFeedback>
    </Backdrop>
  );

  // Usar Modal nativo en Native, Portal en Web
  if (Platform.OS !== 'web') {
    return (
      <RNModal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => onOpenChange(false)}
      >
        {content}
      </RNModal>
    );
  }

  return <Portal>{content}</Portal>;
};

ModalPrimitive.displayName = 'ModalPrimitive';

const styles = StyleSheet.create({
  centered: {
    alignSelf: 'center',
  },
  bottom: {
    alignSelf: 'center',
    marginTop: 'auto',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  focusAnchor: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});
