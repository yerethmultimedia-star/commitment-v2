import React from 'react';
import { TextBase, TextProps } from './TextBase';

export const Title = React.forwardRef<any, Omit<TextProps, 'role'>>((props, ref) => (
  <TextBase ref={ref} role="title" {...(props as any)} />
));

Title.displayName = 'Title';
