import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Check } from '@tamagui/lucide-icons';
import { Card, Body, EmptyState, toPlatformAccessibilityProps } from '@commitment/design-system';
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
          <Body fontSize="$5" fontWeight="600">
            {t('dashboard.widgets.todayHabits.title')}
          </Body>
          <Body
            fontSize="$3"
            fontWeight="600"
            color="$accent"
            onPress={() => router.push('/habits' as any)}
            accessibilityRole="button"
          >
            {t('dashboard.widgets.todayHabits.viewAll')}
          </Body>
        </XStack>

        <YStack gap="$2">
          {todayHabits.length === 0 ? (
            <EmptyState
              fullscreen={false}
              spacing="compact"
              title={{ i18nKey: 'dashboard.widgets.todayHabits.empty.title' }}
              description={{ i18nKey: 'dashboard.widgets.todayHabits.empty.description' }}
            />
          ) : (
            todayHabits.slice(0, 3).map((habit) => (
              <XStack
                key={habit.id}
                alignItems="center"
                gap="$3"
                paddingVertical="$1"
                onPress={() => toggleHabit.mutate({ id: habit.id, completedToday: habit.completedToday })}
                pressStyle={{ opacity: 0.7 }}
                {...toPlatformAccessibilityProps({
                  accessibilityRole: 'checkbox',
                  accessibilityState: { checked: habit.completedToday },
                  accessibilityLabel: t('dashboard.widgets.todayHabits.itemA11y', { title: habit.title }),
                })}
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
                <Body
                  fontSize="$4"
                  numberOfLines={1}
                  flex={1}
                  textDecorationLine={habit.completedToday ? 'line-through' : 'none'}
                >
                  {habit.title}
                </Body>
                {habit.currentStreakDays > 0 && (
                  <Body fontSize="$3" tone="tertiary">
                    {t('dashboard.widgets.todayHabits.consistencyBadge', { count: habit.currentStreakDays })}
                  </Body>
                )}
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </Card>
  );
});
