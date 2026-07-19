import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XStack, YStack } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { AppScreen, Title, Body, IconButton } from '@commitment/design-system';
import { ObjectivesTab } from '../components/ObjectivesTab';
import { GoalCommitmentsTab } from '../components/GoalCommitmentsTab';
import { GoalTasksFlatTab } from '../components/GoalTasksFlatTab';
import { HabitsTab } from '../components/HabitsTab';
import { RoadmapsTab } from '../components/RoadmapsTab';
import { GoalTabStrip } from '../components/GoalTabStrip';
import { useUiStore } from '@/core/store/use-ui-store';
import { useTabBarHeightStore } from '@/shared/store/use-tab-bar-height-store';

// Sprint de Estabilización, Fase 2 — official order Goals/Commitments/Tasks/
// Habits/Roadmap. 'commitments' is the renamed former 'tasks' id (it always
// showed Commitments — see GoalCommitmentsTab.tsx); 'tasks' is new, a flat
// list of every Task, filling the gap that renaming exposed rather than
// leaving "Tasks" absent from a screen that names it in the tab strip.
type GoalsTab = 'objectives' | 'commitments' | 'tasks' | 'habits' | 'roadmaps';
const TABS: GoalsTab[] = ['objectives', 'commitments', 'tasks', 'habits', 'roadmaps'];

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
    // Habits get the full recurrence/reminder-time form (richer than Quick Capture supports).
    // Objetivos/Compromisos route to Quick Capture with a source matching the
    // active sub-tab, so it opens pre-selected to the right type (see
    // QuickCaptureDialog's SOURCE_DEFAULT_TYPE) instead of always defaulting
    // as if the user were on Objetivos. Roadmaps has no capture concept yet
    // (see RoadmapsTab) — its FAB is hidden below rather than opening a
    // dialog with no correct default.
    //
    // 'goals-commitments', not 'tasks': the standalone Tasks screen already
    // uses 'tasks' as its own source string — reusing it here would wrongly
    // default the real Tasks screen's own "+" to Compromiso too (TECH_DEBT
    // Item 34). This tab's id is 'commitments' now (see TABS above), so this
    // branch and that concern are naturally still distinct.
    if (tab === 'habits') {
      router.push('/habits/create' as any);
    } else if (tab === 'commitments') {
      openQuickCapture('goals-commitments');
    } else if (tab === 'tasks') {
      openQuickCapture('goals-tasks');
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
          {tab !== 'roadmaps' && (
            <IconButton
              variant="primary"
              iconToken={<Plus color="$contentOnAccent" />}
              tooltipI18nKey="goals.list.fab.create"
              accessibilityHintI18nKey="goals.list.fab.createHint"
              onPress={handleCreate}
            />
          )}
        </XStack>

        <GoalTabStrip tabs={TABS} active={tab} onChange={setTab} labelFor={(tb) => t(`goals.tabs.${tb}`)} />

        {tab === 'objectives' && <ObjectivesTab />}
        {tab === 'commitments' && <GoalCommitmentsTab />}
        {tab === 'tasks' && <GoalTasksFlatTab />}
        {tab === 'habits' && <HabitsTab />}
        {tab === 'roadmaps' && <RoadmapsTab />}
      </YStack>
    </AppScreen>
  );
}
