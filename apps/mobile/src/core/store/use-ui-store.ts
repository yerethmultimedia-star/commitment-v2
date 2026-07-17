import { create } from 'zustand';

export interface QuickCapturePrefill {
  type: 'goal' | 'commitment' | 'habit' | 'task' | 'note';
  text: string;
}

interface UiStore {
  isQuickCaptureOpen: boolean;
  /** Screen that triggered Quick Capture — carried through as the capture's analytics source. */
  quickCaptureSource: string | null;
  /** Set when Quick Capture is opened from an accepted Coach suggestion. */
  quickCapturePrefill: QuickCapturePrefill | null;
  setQuickCaptureOpen: (open: boolean) => void;
  /** Open Quick Capture and record which screen triggered it. */
  openQuickCapture: (source: string) => void;
  /** Open Quick Capture pre-populated with a type and text (e.g. an accepted Coach suggestion). */
  openQuickCaptureWithPrefill: (source: string, prefill: QuickCapturePrefill) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isQuickCaptureOpen: false,
  quickCaptureSource: null,
  quickCapturePrefill: null,
  setQuickCaptureOpen: (open) => set((state) => ({
    isQuickCaptureOpen: open,
    // Clear prefill on close so the next plain openQuickCapture() call
    // doesn't inherit a stale suggestion.
    quickCapturePrefill: open ? state.quickCapturePrefill : null,
  })),
  openQuickCapture: (source) => set({ isQuickCaptureOpen: true, quickCaptureSource: source, quickCapturePrefill: null }),
  openQuickCaptureWithPrefill: (source, prefill) => set({ isQuickCaptureOpen: true, quickCaptureSource: source, quickCapturePrefill: prefill }),
}));
