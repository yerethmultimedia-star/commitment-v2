import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../storage/secure-storage';
import { v7 as uuidv7 } from 'uuid';

export type SessionStatus = 'Loading' | 'Anonymous' | 'Authenticated';

interface AuthState {
  identityId: string | null;
  sessionStatus: SessionStatus;
  hasSeenOnboarding: boolean;
  isHydrated: boolean;
  
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      identityId: null,
      sessionStatus: 'Loading',
      hasSeenOnboarding: false,
      isHydrated: false,

      login: () => {
        set({ 
          identityId: uuidv7(), 
          sessionStatus: 'Authenticated' 
        });
      },

      logout: () => {
        set({ 
          identityId: null, 
          sessionStatus: 'Anonymous' 
        });
      },

      completeOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      setHydrated: (hydrated) => {
        // Resolve sessionStatus in the same set() call — mutating it
        // separately (as the previous implementation did inside
        // onRehydrateStorage) doesn't go through Zustand's setState, so
        // subscribers are never notified and sessionStatus stays stuck at
        // its initial 'Loading' value forever.
        set((current) => ({
          isHydrated: hydrated,
          sessionStatus: current.identityId ? 'Authenticated' : 'Anonymous',
        }));
      },
    }),
    {
      name: 'commitment-auth-storage',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        // Runs when hydration is done
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
