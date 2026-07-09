import React from 'react';
import { AppScreen, AppScreenProps } from './AppScreen.js';

export const ModalScreen: React.FC<AppScreenProps> = (props) => {
  return <AppScreen {...props} />;
};

ModalScreen.displayName = 'ModalScreen';
