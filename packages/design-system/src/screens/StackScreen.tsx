import React from 'react';
import { AppScreen, AppScreenProps } from './AppScreen.js';

export const StackScreen: React.FC<AppScreenProps> = (props) => {
  return <AppScreen {...props} />;
};

StackScreen.displayName = 'StackScreen';
