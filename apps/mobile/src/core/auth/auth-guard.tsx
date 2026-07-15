import { useEffect } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useSession } from './use-session';

/**
 * Custom hook that listens to session state changes and enforces routing policies.
 * Actual routing calls are stubbed out with console.logs for VS-018.
 * They will be uncommented in VS-019 when screens exist.
 */
export function useAuthGuard() {
  const { isHydrated, sessionStatus, hasSeenOnboarding } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Do not run routing logic until Zustand has restored the persisted state
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Rule 1: Always show onboarding first if not seen
    const segmentsList = segments as string[];
    const currentScreen = segmentsList.length > 1 ? segmentsList[1] : undefined;

    // Prevent navigation loops: don't navigate if already there
    const replace = (path: string) => {
      if (pathname !== path) {
        router.replace(path as any);
      }
    };

    if (!hasSeenOnboarding && currentScreen !== 'onboarding') {
      console.log('🛡️ AuthGuard: Redirecting to onboarding');
      replace('/(auth)/onboarding');
      return;
    }

    // Rule 2: If onboarding is complete but user is anonymous, enforce login.
    // Must check the specific screen (not just inAuthGroup) — onboarding itself
    // is inAuthGroup, so gating on !inAuthGroup here would never fire the
    // redirect the moment hasSeenOnboarding flips true while still on
    // /onboarding, permanently stranding the user there.
    if (hasSeenOnboarding && sessionStatus === 'Anonymous' && currentScreen !== 'login') {
      console.log('🛡️ AuthGuard: Redirecting to login');
      replace('/(auth)/login');
      return;
    }

    // Rule 3: If authenticated but trying to access auth screens (login/onboarding), send to main app
    if (sessionStatus === 'Authenticated' && inAuthGroup) {
      console.log('🛡️ AuthGuard: Redirecting to (tabs)');
      replace('/(tabs)');
      return;
    }
  }, [isHydrated, sessionStatus, hasSeenOnboarding, segments, router, pathname]);
}
