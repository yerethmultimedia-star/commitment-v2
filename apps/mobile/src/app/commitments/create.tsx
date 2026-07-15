import { CreateCommitmentScreen } from '@/features/commitments';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function CreateCommitmentRoute() {
  const { t } = useTranslation('commitments');

  return (
    <>
      <Stack.Screen options={{ title: t('form.title'), presentation: 'modal', headerShown: true }} />
      <CreateCommitmentScreen />
    </>
  );
}
