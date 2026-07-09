import React from 'react';
import { TextBase, TextProps } from './TextBase';

export const Caption = React.forwardRef<any, Omit<TextProps, 'role'>>((props, ref) => (
  <TextBase ref={ref} role="caption" {...(props as any)} />
));

Caption.displayName = 'Caption';
