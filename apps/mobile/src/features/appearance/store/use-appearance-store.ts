import { create } from 'zustand';
import { Appearance, AppearanceSettingsProps } from '@commitment/domain';
import { AppearanceRepositoryImpl } from '../repository/appearance.repository.impl';

// In a real app with DI we might inject this, but for now we instantiate directly
const repository = new AppearanceRepositoryImpl();

interface AppearanceState {
  appearance: Appearance | null;
  isLoading: boolean;
  load: (userId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppearanceSettingsProps>) => Promise<void>;
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  appearance: null,
  isLoading: true,

  load: async (userId: string) => {
    set({ isLoading: true });
    try {
      const appearance = await repository.get(userId);
      set({ appearance, isLoading: false });
    } catch (error) {
      console.error('Failed to load appearance', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (settingsProps: Partial<AppearanceSettingsProps>) => {
    const { appearance } = get();
    if (!appearance) return;

    // We clone/create a new instance to respect immutability
    const updatedAppearance = Appearance.create({
      userId: appearance.userId,
      settings: appearance.settings,
      updatedAt: appearance.updatedAt,
    });
    
    updatedAppearance.updateSettings(settingsProps);

    set({ appearance: updatedAppearance });

    try {
      await repository.save(updatedAppearance);
    } catch (error) {
      console.error('Failed to save appearance', error);
      // Rollback could be implemented here
    }
  },
}));
