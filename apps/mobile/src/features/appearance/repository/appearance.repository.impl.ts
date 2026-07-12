import { Appearance, AppearanceRepository, AppearanceSettings, AppearanceSettingsProps } from '@commitment/domain';
import { secureStorage } from '../../../core/storage/secure-storage';

const APPEARANCE_STORAGE_KEY = 'commitment.appearance.settings';

export class AppearanceRepositoryImpl implements AppearanceRepository {
  async get(userId: string): Promise<Appearance> {
    try {
      const storedData = await secureStorage.getItem(APPEARANCE_STORAGE_KEY);
      
      if (storedData) {
        const parsed = JSON.parse(storedData) as AppearanceSettingsProps;
        return Appearance.create({
          userId,
          settings: AppearanceSettings.create(parsed)
        });
      }
    } catch (error) {
      console.warn('Failed to load appearance settings from SecureStore', error);
    }
    
    // Return default appearance if none saved
    return Appearance.create({ userId });
  }

  async save(appearance: Appearance): Promise<void> {
    try {
      const dataToSave = JSON.stringify(appearance.settings.toJSON());
      await secureStorage.setItem(APPEARANCE_STORAGE_KEY, dataToSave);
    } catch (error) {
      console.error('Failed to save appearance settings to SecureStore', error);
      throw error;
    }
  }
}
