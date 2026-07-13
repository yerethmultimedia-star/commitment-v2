import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { PlatformProvider, PlatformServices } from '@commitment/design-system';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/query/query-client';
import { AuthProvider } from '@/core/auth/auth-provider';
import { StatusBar } from 'expo-status-bar';
import '@/core/i18n'; // Initialize i18n
import { registerDefaultWidgets } from '@/features/dashboard/registry/default-widgets';
import { createKeyboardPlatformAdapter } from '@commitment/platform';

SplashScreen.preventAutoHideAsync();

const platformServices: PlatformServices = {
  haptics: {
    trigger: (type) => {
      console.log('[Haptics] Triggered feedback:', type);
    },
  },
  keyboard: createKeyboardPlatformAdapter(),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    registerDefaultWidgets();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: config.getCSS() }} />
      )}
      <PlatformProvider services={platformServices}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PlatformProvider>
    </TamaguiProvider>
  );
}

