import { PropsWithChildren } from 'react';
import { useAuthGuard } from './auth-guard';
import { useSession } from './use-session';
import { View, ActivityIndicator } from 'react-native';

export function AuthProvider({ children }: PropsWithChildren) {
  const { isHydrated } = useSession();
  
  // The guard enforces route protection and redirects based on state
  useAuthGuard();

  // Show a blank loading screen while Zustand hydrates from SecureStore
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
