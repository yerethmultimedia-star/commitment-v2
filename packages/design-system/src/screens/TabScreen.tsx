import React from 'react';
import { AppScreen, AppScreenProps } from './AppScreen.js';

export const TabScreen: React.FC<AppScreenProps> = (props) => {
  return <AppScreen {...props} />;
};

TabScreen.displayName = 'TabScreen';
