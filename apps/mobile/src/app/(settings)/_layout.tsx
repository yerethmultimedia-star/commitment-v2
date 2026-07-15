import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.title'),
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="appearance"
        options={{
          title: t('settings.rows.theme'),
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: t('settings.language.title'),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
