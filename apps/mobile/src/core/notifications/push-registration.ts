import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { secureStorage } from '@/core/storage/secure-storage';
import { devicesApi } from './devices.api';

const DEVICE_ID_KEY = 'commitment-device-id';

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await secureStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await secureStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/**
 * Requests push notification permission and registers this device's Expo
 * push token with the backend (POST /devices/register), so Habit/Commitment
 * reminders can actually reach it. Deliberately no-ops rather than throwing
 * when push isn't available: web has no Expo push support, and a missing
 * EAS project ID (common in local/dev environments without one configured)
 * would otherwise make `getExpoPushTokenAsync` throw.
 */
export async function registerForPushNotifications(identityId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('[push] Permission not granted, skipping registration.');
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[push] No EAS project ID configured, skipping token registration.');
      return;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const deviceId = await getOrCreateDeviceId();

    await devicesApi.register({
      identityId,
      deviceId,
      platform: Platform.OS,
      pushToken,
      appVersion: Constants.expoConfig?.version ?? '0.0.0',
    });
  } catch (error) {
    console.warn('[push] Registration failed, continuing without push notifications.', error);
  }
}
