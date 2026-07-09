import { useAuthStore } from './auth.store';

/**
 * Hook to access the current session state without exposing the store directly.
 */
export const useSession = () => {
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const identityId = useAuthStore((s) => s.identityId);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return {
    sessionStatus,
    identityId,
    hasSeenOnboarding,
    isHydrated,
  };
};
