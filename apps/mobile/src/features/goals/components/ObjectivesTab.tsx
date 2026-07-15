import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Button as TamaguiButton, ScrollView } from 'tamagui';
import { Body } from '@commitment/design-system';
import { useGoals } from '../hooks/useGoals';
import { GoalCard } from './GoalCard';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';

type StatusChip = 'active' | 'inProgress' | 'completed';
const CHIPS: StatusChip[] = ['active', 'inProgress', 'completed'];

function matchesChip(goal: any, chip: StatusChip): boolean {
  if (chip === 'active') return goal.state === 'Active';
  if (chip === 'inProgress') return goal.state === 'Active' && goal.progress > 0;
  return goal.state === 'Completed';
}

export function ObjectivesTab() {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useGoals();
  const goals = data ?? [];
  const [chip, setChip] = useState<StatusChip>('active');

  const filtered = useMemo(() => goals.filter((g: any) => matchesChip(g, chip)), [goals, chip]);

  if (isLoading) {
    return <Body i18nKey="goals.list.loading" tone="secondary" />;
  }
  if (isError) {
    return (
      <ErrorState
        message={t('goals.list.error.title')}
        retryLabel={t('goals.list.error.retry')}
        onRetry={refetch}
      />
    );
  }

  return (
    <YStack gap="$3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {CHIPS.map((c) => (
            <TamaguiButton
              key={c}
              size="$3"
              backgroundColor={chip === c ? '$accent' : '$surfaceRaised'}
              borderWidth={1}
              borderColor={chip === c ? '$accent' : '$divider'}
              color={chip === c ? '$contentOnAccent' : '$contentSecondary'}
              fontWeight={chip === c ? '700' : '500'}
              pressStyle={{ opacity: 0.85 }}
              onPress={() => setChip(c)}
              accessibilityRole="button"
              accessibilityState={{ selected: chip === c }}
            >
              {t(`goals.statusChips.${c}`)}
            </TamaguiButton>
          ))}
        </XStack>
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          title={t(`goals.statusChips.empty.${chip}.title`)}
          description={t(`goals.statusChips.empty.${chip}.description`)}
        />
      ) : (
        <YStack gap="$3">
          {filtered.map((item: any) => (
            <GoalCard
              key={item.id}
              id={item.id}
              title={item.title}
              category={item.category}
              priority={item.priority}
              progress={item.progress}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}
