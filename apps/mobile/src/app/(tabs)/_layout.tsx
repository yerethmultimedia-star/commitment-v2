import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Commitments',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title', { ns: 'common' }),
        }}
      />
    </Tabs>
  );
}
