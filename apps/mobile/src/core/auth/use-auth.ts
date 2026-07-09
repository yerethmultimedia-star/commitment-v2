import { useAuthStore } from './auth.store';

/**
 * Hook to access authentication actions without exposing the store.
 */
export const useAuth = () => {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  return { login, logout, completeOnboarding };
};
