import React from 'react';
import { TextBase, TextProps } from './TextBase';

export const Body = React.forwardRef<any, Omit<TextProps, 'role'>>((props, ref) => (
  <TextBase ref={ref} role="body" {...(props as any)} />
));

Body.displayName = 'Body';
