import React from 'react';
import { TextBase, TextProps } from './TextBase';

export const Headline = React.forwardRef<any, Omit<TextProps, 'role'>>((props, ref) => (
  <TextBase ref={ref} role="headline" {...(props as any)} />
));

Headline.displayName = 'Headline';
