import React from 'react';
import { View } from 'tamagui';
import { InteractionState } from './InteractionState.js';

export interface FocusRingProps {
  state: InteractionState;
  children: React.ReactNode;
  offset?: number;
  borderRadius?: any;
  /**
   * Defaults to hugging its content (alignSelf: 'flex-start') — correct
   * for controls like Button/IconButton/Switch that shouldn't stretch to
   * fill their parent. Full-width elements (Card, Surface in a list) must
   * pass stretch to fill their container instead of shrinking to their
   * own content width, which otherwise produces cards of uneven width in
   * the same list — see Card.tsx.
   */
  stretch?: boolean;
}

/**
 * A reusable focus ring component.
 * It wraps any interactive element and renders an accessibility-compliant focus ring.
 */
export const FocusRing: React.FC<FocusRingProps> = ({ state, children, offset = 2, borderRadius = '$4', stretch = false }) => {
  return (
    <View position="relative" alignSelf={stretch ? 'stretch' : 'flex-start'} width={stretch ? '100%' : undefined}>
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
