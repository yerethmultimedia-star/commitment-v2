import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DashboardLayout, DashboardLayoutRepository } from '@commitment/domain';

const STORE_KEY = 'dashboard_layout';

// Helper to handle Web compatibility since SecureStore is only for iOS/Android
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } catch (e) {
        // ignore
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }
};

export class DashboardLayoutRepositoryImpl implements DashboardLayoutRepository {
  async get(userId: string): Promise<DashboardLayout | null> {
    try {
      const data = await storage.getItem(`${STORE_KEY}_${userId}`);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Reconstruct domain entity
      return DashboardLayout.create({
        id: parsed.id,
        userId: parsed.userId,
        version: parsed.version,
        widgets: parsed.widgets,
        updatedAt: new Date(parsed.updatedAt),
      });
    } catch (error) {
      console.error('Failed to get dashboard layout', error);
      return null;
    }
  }

  async save(layout: DashboardLayout): Promise<void> {
    try {
      const data = JSON.stringify({
        id: layout.id,
        userId: layout.userId,
        version: layout.version,
        widgets: layout.widgets,
        updatedAt: layout.updatedAt.toISOString(),
      });
      await storage.setItem(`${STORE_KEY}_${layout.userId}`, data);
    } catch (error) {
      console.error('Failed to save dashboard layout', error);
      throw error; // Let the store handle it
    }
  }
}
