import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { Check } from '@tamagui/lucide-icons';
import { Card } from '@commitment/design-system';
import { isHabitDueOn } from '@commitment/domain';
import { useHabits, useToggleHabit } from '@/features/habits/hooks/useHabits';

export const TodayHabitsWidget = React.memo(function TodayHabitsWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: habits = [] } = useHabits();
  const toggleHabit = useToggleHabit();

  const todayHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((h) => h.enabled && isHabitDueOn(h.recurrence, today, new Date(h.recurrenceAnchorDate)));
  }, [habits]);

  return (
    <Card variant="elevated">
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="600" color="$contentPrimary">
            {t('dashboard.widgets.todayHabits.title')}
          </Text>
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$accent"
            onPress={() => router.push('/habits' as any)}
          >
            {t('dashboard.widgets.todayHabits.viewAll')}
          </Text>
        </XStack>

        <YStack gap="$2">
          {todayHabits.length === 0 ? (
            <YStack padding="$4" alignItems="center" backgroundColor="$surface" borderRadius="$3">
              <Text color="$contentPrimary" fontWeight="bold" fontSize="$4">
                {t('dashboard.widgets.todayHabits.empty.title')}
              </Text>
              <Text color="$contentSecondary" fontSize="$3" marginTop="$1">
                {t('dashboard.widgets.todayHabits.empty.description')}
              </Text>
            </YStack>
          ) : (
            todayHabits.slice(0, 3).map((habit) => (
              <XStack
                key={habit.id}
                alignItems="center"
                gap="$3"
                paddingVertical="$1"
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
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
