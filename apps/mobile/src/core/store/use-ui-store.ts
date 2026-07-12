import { create } from 'zustand';

interface UiStore {
  isQuickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isQuickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ isQuickCaptureOpen: open }),
}));
