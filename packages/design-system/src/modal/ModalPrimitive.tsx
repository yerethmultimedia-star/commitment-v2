import React, { useEffect } from 'react';
import { Modal as RNModal, StyleSheet, Platform, BackHandler, TouchableWithoutFeedback } from 'react-native';
import { View, styled } from 'tamagui';
import { Portal } from '../portal/Portal.js';

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
  useEffect(() => {
    if (!open) return;
    
    // Handle Android back button
    const onBackPress = () => {
      onOpenChange(false);
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [open, onOpenChange]);

  if (!open) return null;

  const content = (
    <Backdrop onPress={() => onOpenChange(false)}>
      <TouchableWithoutFeedback>
        <View
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
        >
          {children}
        </View>
      </TouchableWithoutFeedback>
    </Backdrop>
  );

  // Use Native Modal on Native platforms, Portal on Web
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
});
