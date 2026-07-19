import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/core/storage/secure-storage';
import { QuickFilterId } from '../utils/task-filters';

interface TaskListFilterState {
  quickFilter: QuickFilterId;
  setQuickFilter: (filter: QuickFilterId) => void;
}

/**
 * "Recordar la última selección" (Task List UX round §2) — the active
 * quick filter survives navigating away and coming back, and app restarts.
 * First-ever open (nothing persisted yet) defaults to 'today', matching
 * §1's "la vista inicial debe abrir mostrando Hoy" requirement.
 */
export const useTaskListFilterStore = create<TaskListFilterState>()(
  persist(
    (set) => ({
      quickFilter: 'today',
      setQuickFilter: (quickFilter) => set({ quickFilter }),
    }),
    {
      name: 'commitment-task-list-filter-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
