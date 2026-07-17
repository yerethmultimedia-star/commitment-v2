import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlatformProvider, PlatformServices, PortalProvider } from '@commitment/design-system';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/query/query-client';
import { AuthProvider } from '@/core/auth/auth-provider';
import { AppearanceGate } from '@/features/appearance/providers/AppearanceGate';
import { StatusBar } from 'expo-status-bar';
import '@/core/i18n'; // Initialize i18n
// Tamagui's own reset for real HTML elements it renders on web (e.g. a real
// <button> via `render="button"` — see TD-015's `resolveInteractiveElement`)
// — neutralizes the browser's native <button>/<input>/etc chrome (border,
// background, padding) so Tamagui's own explicit styling is the only thing
// that ever paints. Metro/Expo resolves `.css` imports web-only and no-ops
// them on native automatically (same per-platform split as `render` itself,
// not a `Platform.OS` branch of our own).
import '@tamagui/core/reset.css';
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
    // Required by @gorhom/bottom-sheet (react-native-gesture-handler's own
    // peer-dependency requirement) — must wrap the whole app, outermost,
    // so RNGH can correctly arbitrate gestures against RN's native touch
    // responder system. Missing this caused a global scroll regression the
    // instant any screen mounted a GorhomBottomSheet-based component (see
    // TECH_DEBT.md for the full RCA) — this gap was latent until the first
    // real `BottomSheet` (not `Dialog`) consumer existed.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        {Platform.OS === 'web' && (
          <style dangerouslySetInnerHTML={{ __html: config.getCSS() }} />
        )}
        <PortalProvider>
          <PlatformProvider services={platformServices}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <AppearanceGate>
                  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="auto" />
                  </ThemeProvider>
                </AppearanceGate>
              </AuthProvider>
            </QueryClientProvider>
          </PlatformProvider>
        </PortalProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}

