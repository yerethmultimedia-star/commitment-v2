import { PropsWithChildren, useEffect } from 'react';
import { useAuthGuard } from './auth-guard';
import { useSession } from './use-session';
import { Spinner } from 'tamagui';
import { FullScreenCenter } from '@/components/FullScreenCenter';
import { registerForPushNotifications } from '@/core/notifications/push-registration';

export function AuthProvider({ children }: PropsWithChildren) {
  const { isHydrated, sessionStatus, identityId } = useSession();

  // The guard enforces route protection and redirects based on state
  useAuthGuard();

  // Re-registering on every authenticated app launch (not just first login)
  // keeps the push token fresh in case it rotated — the backend endpoint is
  // an upsert by deviceId, so this is safe to call repeatedly.
  useEffect(() => {
    if (sessionStatus === 'Authenticated' && identityId) {
      void registerForPushNotifications(identityId);
    }
  }, [sessionStatus, identityId]);

  // Show a blank loading screen while Zustand hydrates from SecureStore
  if (!isHydrated) {
    return (
      <FullScreenCenter>
        <Spinner size="large" color="$accent" />
      </FullScreenCenter>
    );
  }

  return <>{children}</>;
}
