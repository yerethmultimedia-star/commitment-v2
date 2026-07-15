import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { Stack } from 'expo-router';
import { Check } from '@tamagui/lucide-icons';
import { isHabitDueOn } from '@commitment/domain';
import { AppScreen } from '@commitment/design-system';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { useHabits, useToggleHabit } from '../hooks/useHabits';

/**
 * Full, uncapped list of today's due habits — what "Ver todos" on the Today
 * screen's Hábitos widget opens. Deliberately scoped to TODAY only (same
 * isHabitDueOn filter as the widget), not every habit regardless of
 * recurrence day — that broader management view is Goals > Hábitos.
 */
export function TodayHabitsScreen() {
  const { t } = useTranslation();
  const { data: habits = [], isLoading } = useHabits();
  const toggleHabit = useToggleHabit();

  const todayHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((h) => h.enabled && isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)));
  }, [habits]);

  return (
    <AppScreen scrollable>
      <Stack.Screen options={{ title: t('dashboard.widgets.todayHabits.title'), headerShown: true }} />
      <YStack padding="$4" gap="$4">
        <Text fontSize="$7" fontWeight="bold" color="$contentPrimary">
          {t('dashboard.widgets.todayHabits.title')}
        </Text>

        {!isLoading && todayHabits.length === 0 ? (
          <EmptyState
            title={t('dashboard.widgets.todayHabits.empty.title')}
            description={t('dashboard.widgets.todayHabits.empty.description')}
          />
        ) : (
          <YStack gap="$2">
            {todayHabits.map((habit) => (
              <XStack
                key={habit.id}
                alignItems="center"
                gap="$3"
                paddingVertical="$2"
                onPress={() => toggleHabit.mutate({ id: habit.id, completedToday: habit.completedToday })}
                pressStyle={{ opacity: 0.7 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: habit.completedToday }}
                accessibilityLabel={t('dashboard.widgets.todayHabits.itemA11y', { title: habit.title })}
              >
                <YStack
                  width={22}
                  height={22}
                  borderRadius={11}
                  borderWidth={2}
                  borderColor={habit.completedToday ? '$success' : '$divider'}
                  backgroundColor={habit.completedToday ? '$success' : 'transparent'}
                  alignItems="center"
                  justifyContent="center"
                >
                  {habit.completedToday && <Check size={14} color="$contentOnSemantic" />}
                </YStack>
                <Text
                  color="$contentPrimary"
                  fontSize="$4"
                  numberOfLines={1}
                  flex={1}
                  textDecorationLine={habit.completedToday ? 'line-through' : 'none'}
                >
                  {habit.title}
                </Text>
                {habit.currentStreakDays > 0 && (
                  <Text fontSize="$3" color="$contentTertiary">
                    {t('dashboard.widgets.todayHabits.streak', { count: habit.currentStreakDays })}
                  </Text>
                )}
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </AppScreen>
  );
}
