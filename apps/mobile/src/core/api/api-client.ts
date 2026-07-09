import ky from 'ky';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamically determine the API base URL.
// If running on local simulator/emulator, use correct localhost IPs.
const getBaseUrl = () => {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return 'https://api.commitment.app';

  if (Platform.OS === 'android') {
    // Android emulator alias to host machine localhost
    return 'http://10.0.2.2:3000';
  }

  // iOS simulator or default localhost
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

/**
 * Global HTTP Client configured with base URL, retries, and default headers.
 * Interceptors can be added here for JWT and request-ids.
 */
export const apiClient = ky.create({
  prefixUrl: `${baseUrl}/v1`,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Automatically attach x-request-id for observability (VS-016)
        request.headers.set('x-request-id', crypto.randomUUID());
      },
    ],
  },
});
