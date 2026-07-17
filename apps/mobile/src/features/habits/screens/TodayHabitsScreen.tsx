import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';
import { Stack, useRouter } from 'expo-router';
import { isHabitDueOn } from '@commitment/domain';
import { AppScreen, Button, EmptyState, LoadingState } from '@commitment/design-system';
import { useHabits, useToggleHabit } from '../hooks/useHabits';
import { HabitsHero } from '../components/HabitsHero';
import { HabitCard } from '../components/HabitCard';

/**
 * Full, uncapped list of today's due habits — what "Ver todos" on the Today
 * screen's Hábitos widget opens. Deliberately scoped to TODAY only (same
 * isHabitDueOn filter as the widget), not every habit regardless of
 * recurrence day — that broader management view is Goals > Hábitos.
 *
 * Redesigned 2026-07-15 (Habits UX pass) around `HabitsHero` + `HabitCard`.
 * Iteration 2 (same day, after user review of iteration 1): the list is now
 * execution-only — tapping a card opens the habit's detail
 * (`/habits/[id]/edit`, which now also hosts Postpone/Archive/Goal-context);
 * only the completion circle acts without navigating. Also fixes a
 * P2-pattern duplicated title this screen had but the original audit never
 * named: the native Stack header already says "Hábitos de Hoy" — the body
 * doesn't repeat it as its own `<Title>`; `HabitsHero`'s own small label
 * carries that context instead, paired with the completion ratio.
 */
export function TodayHabitsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: habits = [], isLoading } = useHabits();
  const toggleHabit = useToggleHabit();

  const todayHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((h) => h.enabled && isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)));
  }, [habits]);

  const completedCount = useMemo(() => todayHabits.filter((h) => h.completedToday).length, [todayHabits]);

  const currentStreak = useMemo(
    () => todayHabits.reduce((max, h) => Math.max(max, h.currentStreakDays), 0),
    [todayHabits]
  );

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: t('dashboard.widgets.todayHabits.title'), headerShown: true }} />
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        {isLoading ? (
          <LoadingState fullscreen={false} title={{ i18nKey: 'habits.workspace.loading' }} />
        ) : todayHabits.length === 0 ? (
          <EmptyState
            fullscreen={false}
            spacing="spacious"
            title={{ i18nKey: 'habits.empty.title' }}
            description={{ i18nKey: 'habits.empty.description' }}
            primaryAction={
              <Button variant="primary" i18nKey="habits.empty.cta" onPress={() => router.push('/habits/create' as any)} />
            }
          />
        ) : (
          <>
            <HabitsHero completed={completedCount} total={todayHabits.length} currentStreak={currentStreak} />
            <YStack gap="$3">
              {todayHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={() => toggleHabit.mutate({ id: habit.id, completedToday: habit.completedToday })}
                  onPress={() => router.push(`/habits/${habit.id}/edit` as any)}
                />
              ))}
            </YStack>
          </>
        )}
      </YStack>
    </AppScreen>
  );
}
