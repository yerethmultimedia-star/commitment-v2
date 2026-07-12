import ky from 'ky';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../auth/auth.store';
import i18next from 'i18next';

// Dynamically determine the API base URL.
// If running on local simulator/emulator, use correct localhost IPs.
const getBaseUrl = () => {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return 'https://api.commitment.app';

  if (Platform.OS === 'android') {
    // Android emulator alias to host machine localhost
    return 'http://10.0.2.2:4000';
  }

  // iOS simulator or default localhost
  return 'http://localhost:4000';
};

const baseUrl = getBaseUrl();

/**
 * Global HTTP Client configured with base URL, retries, and default headers.
 * Interceptors can be added here for JWT and request-ids.
 */
export const apiClient = ky.create({
  // @ts-ignore
  prefix: `${baseUrl}/v1`,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      ((request: any, options: any) => {
        // Generate UUID safely since crypto might not be available in React Native without polyfills
        let uuid = 'dev-uuid';
        try {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            uuid = crypto.randomUUID();
          } else {
            uuid = Math.random().toString(36).substring(2) + Date.now().toString(36);
          }
        } catch (e) {}

        const { identityId, sessionStatus } = useAuthStore.getState();

        // 1. Try setting headers on options object if it exists
        if (options) {
          try {
            if (!options.headers) {
              options.headers = new Headers();
            } else if (!(options.headers instanceof Headers)) {
              options.headers = new Headers(options.headers);
            }
            
            const headers = options.headers as Headers;
            headers.set('x-request-id', uuid);
            if (sessionStatus === 'Authenticated' && identityId) {
              headers.set('x-identity-id', identityId);
            }
            if (i18next.language) {
              headers.set('Accept-Language', i18next.language);
            }
          } catch (e) {
            console.warn('Failed to set headers on options', e);
          }
        }
        
        // 2. Try setting headers on request object if it and request.headers exists
        if (request && request.headers && typeof request.headers.set === 'function') {
          try {
            request.headers.set('x-request-id', uuid);
            if (sessionStatus === 'Authenticated' && identityId) {
              request.headers.set('x-identity-id', identityId);
            }
            if (i18next.language) {
              request.headers.set('Accept-Language', i18next.language);
            }
          } catch (e) {
            console.warn('Failed to set headers on request object', e);
          }
        }
      }) as any,
    ],
  },
});
