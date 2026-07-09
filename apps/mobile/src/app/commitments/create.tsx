import { CreateCommitmentScreen } from '@/features/commitments';
import { Stack } from 'expo-router';

export default function CreateCommitmentRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Create', presentation: 'modal', headerShown: true }} />
      <CreateCommitmentScreen />
    </>
  );
}
