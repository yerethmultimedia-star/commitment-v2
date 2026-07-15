import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XStack, YStack, ScrollView } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { AppScreen, Title, Body, IconButton } from '@commitment/design-system';
import { ObjectivesTab } from '../components/ObjectivesTab';
import { GoalTasksTab } from '../components/GoalTasksTab';
import { HabitsTab } from '../components/HabitsTab';
import { RoadmapsTab } from '../components/RoadmapsTab';
import { useUiStore } from '@/core/store/use-ui-store';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';

type GoalsTab = 'objectives' | 'tasks' | 'habits' | 'roadmaps';
const TABS: GoalsTab[] = ['objectives', 'tasks', 'habits', 'roadmaps'];

function isGoalsTab(value: unknown): value is GoalsTab {
  return typeof value === 'string' && (TABS as string[]).includes(value);
}

export function GoalsScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const openQuickCapture = useUiStore((s) => s.openQuickCapture);
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  // Deep-link support (e.g. Today's "Ver todos" habits link → /(tabs)/goals?tab=habits).
  const [tab, setTab] = useState<GoalsTab>(isGoalsTab(tabParam) ? tabParam : 'objectives');
  const tabBarInset = useTabBarHeightStore((s) => s.reservedHeight);

  // Expo Router's tab navigator keeps this screen mounted across visits (no
  // unmountOnBlur), so the useState initializer above only runs once ever —
  // a second visit with a different ?tab= param would otherwise leave the
  // tab wherever it was last locally set. Re-sync whenever the param itself
  // changes; manual taps on the tab strip afterward are untouched since
  // tabParam stays the same string until the next deep link.
  useEffect(() => {
    if (isGoalsTab(tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleCreate = () => {
    // Habits get the full recurrence/reminder-time form (richer than Quick Capture supports); everything else still uses Quick Capture.
    if (tab === 'habits') {
      router.push('/habits/create' as any);
    } else {
      openQuickCapture('goals');
    }
  };

  return (
    <AppScreen scrollable announceOnFocus="Goals screen loaded" contentBottomInset={tabBarInset}>
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap="$xs" flex={1}>
            <Title i18nKey="goals.list.title" />
            <Body tone="secondary" i18nKey="goals.list.subtitle" />
          </YStack>
          <IconButton
            variant="primary"
            iconToken={<Plus color="$contentOnAccent" />}
            tooltipI18nKey="goals.list.fab.create"
            accessibilityHintI18nKey="goals.list.fab.createHint"
            onPress={handleCreate}
          />
        </XStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$md" borderBottomWidth={1} borderBottomColor="$divider">
            {TABS.map((tb) => (
              <YStack
                key={tb}
                onPress={() => setTab(tb)}
                paddingBottom="$2"
                borderBottomWidth={2}
                borderBottomColor={tab === tb ? '$accent' : 'transparent'}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === tb }}
              >
                <Body fontWeight={tab === tb ? '700' : '500'} color={tab === tb ? '$accent' : '$contentSecondary'}>
                  {t(`goals.tabs.${tb}`)}
                </Body>
              </YStack>
            ))}
          </XStack>
        </ScrollView>

        {tab === 'objectives' && <ObjectivesTab />}
        {tab === 'tasks' && <GoalTasksTab />}
        {tab === 'habits' && <HabitsTab />}
        {tab === 'roadmaps' && <RoadmapsTab />}
      </YStack>
    </AppScreen>
  );
}
