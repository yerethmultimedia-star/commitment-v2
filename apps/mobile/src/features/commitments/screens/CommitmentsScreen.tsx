import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import { YStack, Text, Button } from 'tamagui';
import { useCommitments } from '../hooks/useCommitments';
import { CommitmentCard } from '../components/CommitmentCard';
import { CommitmentsSkeleton } from '../components/CommitmentsSkeleton';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

export function CommitmentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCommitments();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('list.greeting.morning', { ns: 'commitments' });
    if (hour < 18) return t('list.greeting.afternoon', { ns: 'commitments' });
    return t('list.greeting.evening', { ns: 'commitments' });
  };

  const renderHeader = () => (
    <YStack padding="$4" gap="$4">
      <YStack>
        <Text fontSize="$4" color="$textSecondary">{getGreeting()}</Text>
        <Text fontSize="$8" fontWeight="bold">Welcome back</Text>
      </YStack>

      <YStack backgroundColor="$blue5" padding="$4" borderRadius="$4">
        <Text fontSize="$3" color="$blue10" fontWeight="bold" textTransform="uppercase">
          {t('list.summary.active', { ns: 'commitments' })}
        </Text>
        <Text fontSize="$8" fontWeight="bold" color="$blue10">
          {data?.length || 0}
        </Text>
      </YStack>
    </YStack>
  );

  const renderEmpty = () => {
    if (isLoading) return <CommitmentsSkeleton />;
    if (isError) {
      return (
        <ErrorState 
          message={t('list.error.title', { ns: 'commitments' })} 
          retryLabel={t('list.error.retry', { ns: 'commitments' })} 
          onRetry={refetch} 
        />
      );
    }
    return (
      <EmptyState 
        title={t('list.empty.title', { ns: 'commitments' })}
        description={t('list.empty.description', { ns: 'commitments' })}
      />
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlashList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <YStack paddingHorizontal="$4" paddingBottom="$3">
            <CommitmentCard commitment={item} />
          </YStack>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      {/* FAB */}
      <Button
        position="absolute"
        bottom="$6"
        right="$6"
        size="$6"
        circular
        theme="active"
        elevation="$4"
        accessibilityRole="button"
        accessibilityLabel={t('list.fab.create', { ns: 'commitments' })}
        onPress={() => router.push('/commitments/create')}
      >
        <Text color="white" fontSize="$6">+</Text>
      </Button>
    </YStack>
  );
}
