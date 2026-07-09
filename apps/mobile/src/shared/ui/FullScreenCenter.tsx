import { PropsWithChildren } from 'react';
import { YStack, YStackProps } from 'tamagui';

/**
 * Reusable full screen center layout for Loading, Empty, and Splash states.
 */
export function FullScreenCenter({ children, ...props }: PropsWithChildren<YStackProps>) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" {...props}>
      {children}
    </YStack>
  );
}
