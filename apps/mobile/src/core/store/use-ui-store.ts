import { create } from 'zustand';

export interface QuickCapturePrefill {
  type: 'goal' | 'commitment' | 'habit' | 'task' | 'note';
  text: string;
}

interface UiStore {
  /** Sprint de Estabilización, Fase 3 (Quick Action Menu) — the "+" entry
   * point now opens this menu first, not the capture dialog directly. Picking
   * a capture type from it calls openQuickCaptureWithPrefill() below with an
   * empty text, the same mechanism Coach's "accept suggestion" flow already
   * used — no second capture pathway, per ADR-020's Universal Capture rule. */
  isQuickActionMenuOpen: boolean;
  isQuickCaptureOpen: boolean;
  /** Screen that triggered Quick Capture — carried through as the capture's analytics source. */
  quickCaptureSource: string | null;
  /** Set when Quick Capture is opened from an accepted Coach suggestion, or a Quick Action Menu selection. */
  quickCapturePrefill: QuickCapturePrefill | null;
  setQuickActionMenuOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  /** Open the Quick Action Menu and record which screen triggered it. */
  openQuickCapture: (source: string) => void;
  /** Open Quick Capture directly (skipping the menu), pre-populated with a type and text — an accepted Coach suggestion, or a Quick Action Menu selection (text: ''). */
  openQuickCaptureWithPrefill: (source: string, prefill: QuickCapturePrefill) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isQuickActionMenuOpen: false,
  isQuickCaptureOpen: false,
  quickCaptureSource: null,
  quickCapturePrefill: null,
  setQuickActionMenuOpen: (open) => set({ isQuickActionMenuOpen: open }),
  setQuickCaptureOpen: (open) => set((state) => ({
    isQuickCaptureOpen: open,
    // Clear prefill on close so the next plain openQuickCapture() call
    // doesn't inherit a stale suggestion.
    quickCapturePrefill: open ? state.quickCapturePrefill : null,
  })),
  openQuickCapture: (source) => set({ isQuickActionMenuOpen: true, quickCaptureSource: source, quickCapturePrefill: null }),
  openQuickCaptureWithPrefill: (source, prefill) => set({ isQuickCaptureOpen: true, quickCaptureSource: source, quickCapturePrefill: prefill }),
}));
