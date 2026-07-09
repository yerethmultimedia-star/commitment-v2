import React from 'react';
import { TextBase, TextProps } from './TextBase';

export const Label = React.forwardRef<any, Omit<TextProps, 'role'>>((props, ref) => (
  <TextBase ref={ref} role="label" {...(props as any)} />
));

Label.displayName = 'Label';
