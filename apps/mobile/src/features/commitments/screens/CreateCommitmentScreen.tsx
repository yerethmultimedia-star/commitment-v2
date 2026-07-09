import { useRouter } from 'expo-router';
import { YStack, ScrollView, Text } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { CommitmentForm } from '../components/forms/CommitmentForm';
import { useCreateCommitment } from '../hooks/useCreateCommitment';
import { CommitmentFormValues } from '../models/commitment.schema';
import { Alert } from 'react-native';

export function CreateCommitmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutateAsync } = useCreateCommitment();

  const handleSubmit = async (values: CommitmentFormValues) => {
    try {
      // Optimistic navigation
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
      
      // Fire mutation in background (already wrapped with try/catch inside React Query for state,
      // but if we await we can catch network errors if we want to show a Toast later)
      mutateAsync(values).catch(() => {
        // We could show a toast here in the future
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$4" gap="$6" paddingBottom="$10">
        <Text fontSize="$8" fontWeight="bold" color="$text">
          {t('form.title', { ns: 'commitments' })}
        </Text>
        
        <CommitmentForm 
          onSubmit={handleSubmit} 
        />
      </YStack>
    </ScrollView>
  );
}
