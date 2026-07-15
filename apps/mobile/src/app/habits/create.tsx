import { CreateHabitScreen } from '@/features/habits';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function CreateHabitRoute() {
  const { t } = useTranslation('common');

  return (
    <>
      <Stack.Screen options={{ title: t('habits.form.createTitle'), presentation: 'modal', headerShown: true }} />
      <CreateHabitScreen />
    </>
  );
}
