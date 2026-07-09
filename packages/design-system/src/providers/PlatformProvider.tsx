import React, { createContext, ReactNode } from 'react';
import { HapticsProvider, ClipboardProvider, ShareProvider, DeviceProvider, StorageProvider, NotificationProvider, PermissionsProvider } from '@commitment/platform';

export interface PlatformServices {
  haptics: HapticsProvider;
  clipboard?: ClipboardProvider;
  share?: ShareProvider;
  device?: DeviceProvider;
  storage?: StorageProvider;
  notification?: NotificationProvider;
  permissions?: PermissionsProvider;
}

export const PlatformContext = createContext<PlatformServices | null>(null);

export interface PlatformProviderProps {
  services: PlatformServices;
  children: ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ services, children }) => {
  return (
    <PlatformContext.Provider value={services}>
      {children}
    </PlatformContext.Provider>
  );
};
