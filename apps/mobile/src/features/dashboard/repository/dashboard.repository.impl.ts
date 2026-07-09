import * as SecureStore from 'expo-secure-store';
import { DashboardLayout, DashboardLayoutRepository } from '@commitment/domain';

const STORE_KEY = 'dashboard_layout';

export class DashboardLayoutRepositoryImpl implements DashboardLayoutRepository {
  async get(userId: string): Promise<DashboardLayout | null> {
    try {
      const data = await SecureStore.getItemAsync(`${STORE_KEY}_${userId}`);
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
      await SecureStore.setItemAsync(`${STORE_KEY}_${layout.userId}`, data);
    } catch (error) {
      console.error('Failed to save dashboard layout', error);
      throw error; // Let the store handle it
    }
  }
}
