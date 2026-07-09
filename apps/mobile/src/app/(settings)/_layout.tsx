import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="appearance" 
        options={{ 
          title: 'Appearance', 
          presentation: 'card' 
        }} 
      />
    </Stack>
  );
}
