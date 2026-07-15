import { PropsWithChildren } from 'react';
import { useSession } from '@/core/auth/use-session';
import { AppearanceProvider } from './AppearanceProvider';

/**
 * AppearanceProvider requires an authenticated userId to load persisted
 * settings. Onboarding/login render fine under Tamagui's static default
 * theme, so the Experience Themes system only mounts once a session exists.
 */
export function AppearanceGate({ children }: PropsWithChildren) {
  const { sessionStatus, identityId } = useSession();

  if (sessionStatus === 'Authenticated' && identityId) {
    return <AppearanceProvider userId={identityId}>{children}</AppearanceProvider>;
  }

  return <>{children}</>;
}
