import React from 'react';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { EmptyState, LoadingState } from '@commitment/design-system';
import { useHabits, useToggleHabit } from '@/features/habits/hooks/useHabits';
import { HabitCard } from '@/features/habits/components/HabitCard';

/** "Hábitos" — every Habit across every Goal, flat. Same useHabits data the Today widget and Goal Workspace already read.
 *  Enable/disable, postpone, and edit all live in the habit's detail (tap the card) — the list is
 *  for executing habits fast, not managing them (2026-07-15, Habits UX pass iteration 2). */
export function HabitsTab() {
  const router = useRouter();
  const { data: habits = [], isLoading } = useHabits();
  const toggleHabit = useToggleHabit();

  if (isLoading) {
    return <LoadingState fullscreen={false} title={{ i18nKey: 'goals.list.loading' }} />;
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        fullscreen={false}
        title={{ i18nKey: 'goals.habitsTab.empty.title' }}
        description={{ i18nKey: 'goals.habitsTab.empty.description' }}
      />
    );
  }

  return (
    <YStack gap="$3">
      {habits.map((h) => (
        <HabitCard
          key={h.id}
          habit={h}
          onToggle={() => toggleHabit.mutate({ id: h.id, completedToday: h.completedToday })}
          onPress={() => router.push(`/habits/${h.id}` as any)}
        />
      ))}
    </YStack>
  );
}
