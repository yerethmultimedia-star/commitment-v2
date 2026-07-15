import { create } from 'zustand';

interface TabBarHeightState {
  /** Total vertical space the floating tab bar occupies from the screen's bottom edge (its own height + its bottom offset) — everything a scrollable screen needs to reserve so its last item isn't hidden behind the bar. */
  reservedHeight: number;
  setReservedHeight: (height: number) => void;
}

// 90 is a reasonable pre-measurement fallback (roughly the bar's actual
// height + bottom margin) — FloatingTabBar overwrites this via onLayout as
// soon as it first renders, so this only matters for the first frame.
export const useTabBarHeightStore = create<TabBarHeightState>((set) => ({
  reservedHeight: 90,
  setReservedHeight: (reservedHeight) => set({ reservedHeight }),
}));
