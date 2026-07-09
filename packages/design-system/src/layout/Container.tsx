import React from 'react';
import { View, ViewProps } from 'tamagui';

export interface ContainerProps extends ViewProps {
  maxWidth?: number | string;
  centered?: boolean;
}

export const Container = React.forwardRef<any, ContainerProps>(({
  maxWidth = 800, // typical default for reading width
  centered = true,
  ...props
}, ref) => {
  return (
    <View
      ref={ref}
      width="100%"
      maxWidth={maxWidth}
      marginHorizontal={centered ? 'auto' : undefined}
      {...props}
    />
  );
});

Container.displayName = 'Container';
