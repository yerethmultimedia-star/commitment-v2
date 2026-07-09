import React from 'react';
import { ScreenScroll, ScreenScrollProps } from '../scroll/ScreenScroll.js';

export const KeyboardAwareScroll = React.forwardRef<any, ScreenScrollProps>((props, ref) => {
  return <ScreenScroll ref={ref} keyboardAware={true} {...props} />;
});

KeyboardAwareScroll.displayName = 'KeyboardAwareScroll';
export type KeyboardAwareScrollProps = ScreenScrollProps;
