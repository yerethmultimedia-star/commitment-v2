import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Button as TamaguiButton, ScrollView } from 'tamagui';
import { EmptyState, ErrorState, LoadingState, Button, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useGoalsView } from '../hooks/useGoalsView';
import { GoalCard } from './GoalCard';
import { GoalViewModel } from '../models/goal.model';

// Decisión B, Goal Lifecycle: 'draft' added so a freshly created Goal (which
// now genuinely starts in Draft, both in Demo Mode and on the real backend)
// stays visible somewhere on this screen instead of disappearing until
// activated (golden_path_goal_creation.md's blocker).
type StatusChip = 'draft' | 'active' | 'inProgress' | 'completed';
const CHIPS: StatusChip[] = ['draft', 'active', 'inProgress', 'completed'];

function matchesChip(goal: GoalViewModel, chip: StatusChip): boolean {
  if (chip === 'draft') return goal.state === 'Draft';
  if (chip === 'active') return goal.state === 'Active';
  if (chip === 'inProgress') return goal.state === 'Active' && goal.progress > 0;
  return goal.state === 'Completed';
}

export function ObjectivesTab() {
  const { t } = useTranslation('common');
  const { data, isLoading, isError, refetch } = useGoalsView();
  const goals = data ?? [];
  const [chip, setChip] = useState<StatusChip>('active');

  const filtered = useMemo(() => goals.filter((g) => matchesChip(g, chip)), [goals, chip]);

  if (isLoading) {
    return <LoadingState fullscreen={false} title={{ i18nKey: 'goals.list.loading' }} />;
  }
  if (isError) {
    return (
      <ErrorState
        fullscreen={false}
        title={{ i18nKey: 'goals.list.error.title' }}
        primaryAction={<Button variant="primary" onPress={refetch} i18nKey="goals.list.error.retry" />}
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
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected: chip === c },
              })}
            >
              {t(`goals.statusChips.${c}`)}
            </TamaguiButton>
          ))}
        </XStack>
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          fullscreen={false}
          title={{ i18nKey: `goals.statusChips.empty.${chip}.title` }}
          description={{ i18nKey: `goals.statusChips.empty.${chip}.description` }}
        />
      ) : (
        <YStack gap="$3">
          {filtered.map((item) => (
            <GoalCard key={item.id} goal={item} />
          ))}
        </YStack>
      )}
    </YStack>
  );
}
