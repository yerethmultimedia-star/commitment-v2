import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../storage/secure-storage';

interface DemoModeState {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
}

/**
 * Demo Mode is a data-source switch, not a UI switch. Reading it directly in
 * a component to change what renders is the wrong integration point — the
 * intended seam is the API layer (each feature's api module, e.g.
 * commitments.api.ts), which checks this store and returns from the demo
 * dataset instead of calling apiClient. Components and hooks never branch
 * on demo mode.
 */
export const useDemoModeStore = create<DemoModeState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      setDemoMode: (enabled) => set({ isDemoMode: enabled }),
      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
    }),
    {
      name: 'commitment-demo-mode-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

/** Non-reactive read for use outside React components (e.g. inside API modules). */
export function isDemoModeActive(): boolean {
  return useDemoModeStore.getState().isDemoMode;
}
