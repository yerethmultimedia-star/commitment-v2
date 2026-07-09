import React from 'react';
import { XStack, XStackProps } from 'tamagui';
import { SpaceTokens } from '../tokens/space';

export interface InlineProps extends Omit<XStackProps, 'gap'> {
  gap?: SpaceTokens;
}

export const Inline = React.forwardRef<any, InlineProps>(({ gap, ...props }, ref) => {
  return <XStack ref={ref} gap={gap} {...props} />;
});

Inline.displayName = 'Inline';
