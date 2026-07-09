import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StorageAdapter } from './storage.interface';

/**
 * StorageAdapter implementation that uses expo-secure-store on mobile,
 * and falls back to localStorage on web.
 */
export const secureStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
      return null;
    }
    
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`SecureStore Error reading key ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`SecureStore Error writing key ${key}:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`SecureStore Error deleting key ${key}:`, error);
    }
  },
};
