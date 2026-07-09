import React from 'react';
import { YStack, YStackProps } from 'tamagui';
import { SpaceTokens } from '../tokens/space';

export interface StackProps extends Omit<YStackProps, 'gap'> {
  gap?: SpaceTokens;
}

export const Stack = React.forwardRef<any, StackProps>(({ gap, ...props }, ref) => {
  return <YStack ref={ref} gap={gap} {...props} />;
});

Stack.displayName = 'Stack';
