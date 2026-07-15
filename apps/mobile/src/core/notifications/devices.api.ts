import { apiClient } from '@/core/api/api-client';
import { isDemoModeActive } from '@/core/demo/demo-mode.store';

export interface RegisterDevicePayload {
  identityId: string;
  deviceId: string;
  platform: string;
  pushToken: string;
  appVersion: string;
}

// Demo mode has no real backend identity to register a push token against —
// this is a deliberate no-op there, same demo-mode-switch-at-the-boundary
// pattern as every other *.api.ts in this app.
export const devicesApi = {
  register: async (payload: RegisterDevicePayload): Promise<void> => {
    if (isDemoModeActive()) return;
    await apiClient.post('devices/register', { json: payload });
  },
};
