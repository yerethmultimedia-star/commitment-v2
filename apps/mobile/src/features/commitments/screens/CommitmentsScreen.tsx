import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Title, Body, Button, VirtualizedScreen } from '@commitment/design-system';
import { useCommitments } from '../hooks/useCommitments';
import { CommitmentCard } from '../components/CommitmentCard';
import { CommitmentsSkeleton } from '../components/CommitmentsSkeleton';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';
import { useRouter } from 'expo-router';
import { Filter, Plus } from '@tamagui/lucide-icons';
import { View } from 'tamagui';
import { IconButton } from '@commitment/design-system';

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
    <Stack padding="$md" gap="$md">
      <Stack>
        <Body tone="secondary">{getGreeting()}</Body>
        <Title>Welcome back</Title>
      </Stack>

      <Stack backgroundColor="$blue5" padding="$md" borderRadius="$4">
        <Body fontWeight="bold" color="$blue10" style={{ textTransform: 'uppercase' as any }}>
          {t('list.summary.active', { ns: 'commitments' })}
        </Body>
        <Title color="$blue10">
          {String(data?.length || 0)}
        </Title>
      </Stack>
    </Stack>
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
    <Stack flex={1} backgroundColor="$background">
      <VirtualizedScreen
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Stack paddingHorizontal="$4" paddingBottom="$3">
            <CommitmentCard commitment={item} />
          </Stack>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      {/* FAB */}
      <View position="absolute" bottom="$6" right="$6" zIndex={100}>
        <IconButton
          variant="primary"
          iconToken={<Plus color="white" />}
          tooltipI18nKey="list.fab.create"
          onPress={() => router.push('/commitments/create')}
        />
      </View>
    </Stack>
  );
}
