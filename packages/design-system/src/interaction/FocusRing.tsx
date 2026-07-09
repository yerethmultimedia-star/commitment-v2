import React from 'react';
import { View } from 'tamagui';
import { InteractionState } from './InteractionState.js';

export interface FocusRingProps {
  state: InteractionState;
  children: React.ReactNode;
  offset?: number;
  borderRadius?: any;
}

/**
 * A reusable focus ring component.
 * It wraps any interactive element and renders an accessibility-compliant focus ring.
 */
export const FocusRing: React.FC<FocusRingProps> = ({ state, children, offset = 2, borderRadius = '$4' }) => {
  return (
    <View position="relative" alignSelf="flex-start">
      {children}
      {state.focused && (
        <View
          position="absolute"
          top={-offset}
          left={-offset}
          right={-offset}
          bottom={-offset}
          borderRadius={borderRadius}
          borderWidth={2}
          borderColor="$focus"
          pointerEvents="none"
          opacity={1}
        />
      )}
    </View>
  );
};
