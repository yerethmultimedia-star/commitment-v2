export interface ClipboardProvider {
  getStringAsync(): Promise<string>;
  setStringAsync(text: string): Promise<void>;
}

export interface ShareProvider {
  shareAsync(content: { title?: string; message?: string; url?: string }): Promise<void>;
}

export interface DeviceProvider {
  getDeviceModel(): string;
  getOsVersion(): string;
  isTablet(): boolean;
}

export interface StorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface NotificationProvider {
  requestPermission(): Promise<boolean>;
  scheduleNotification(title: string, body: string, date: Date): Promise<string>;
  cancelNotification(id: string): Promise<void>;
}

export interface PermissionsProvider {
  check(permission: string): Promise<boolean>;
  request(permission: string): Promise<boolean>;
}
