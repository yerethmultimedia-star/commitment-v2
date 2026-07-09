import React from 'react';
import { TouchableWithoutFeedback, Keyboard, StyleSheet, View } from 'react-native';

export interface KeyboardDismissAreaProps {
  children: React.ReactNode;
}

export const KeyboardDismissArea: React.FC<KeyboardDismissAreaProps> = ({ children }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

KeyboardDismissArea.displayName = 'KeyboardDismissArea';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
