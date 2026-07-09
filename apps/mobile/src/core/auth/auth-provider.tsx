import { PropsWithChildren } from 'react';
import { useAuthGuard } from './auth-guard';
import { useSession } from './use-session';
import { Spinner } from 'tamagui';
import { FullScreenCenter } from '@/components/FullScreenCenter';

export function AuthProvider({ children }: PropsWithChildren) {
  const { isHydrated } = useSession();
  
  // The guard enforces route protection and redirects based on state
  useAuthGuard();

  // Show a blank loading screen while Zustand hydrates from SecureStore
  if (!isHydrated) {
    return (
      <FullScreenCenter>
        <Spinner size="large" color="$blue10" />
      </FullScreenCenter>
    );
  }

  return <>{children}</>;
}
