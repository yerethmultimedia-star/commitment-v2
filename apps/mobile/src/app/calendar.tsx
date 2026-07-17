import React, { useMemo, useState } from 'react';
import { Stack as ExpoStack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, Circle, ScrollView } from 'tamagui';
import { ChevronLeft, ChevronRight, Plus } from '@tamagui/lucide-icons';
import { AppScreen, Card, Body, IconButton, Button, EmptyState, LoadingState, toPlatformAccessibilityProps } from '@commitment/design-system';
import { formatDate, formatWeekday, formatWeekdayNarrow } from '@commitment/localization';
import { AgendaItem, AgendaItemType } from '@commitment/domain';
import { useDayAgenda } from '@/features/calendar/hooks/useDayAgenda';
import { useUiStore } from '@/core/store/use-ui-store';

const TYPE_DOT_COLOR: Record<AgendaItemType, string> = {
  task: '$accent',
  commitment: '$success',
  habit: '$warning',
  milestone: '$interactive',
  reminder: '$danger',
};

/** Where tapping an agenda item navigates — Milestones have no screen of
 * their own, so their `sourceId` is the owning Goal's id (see
 * `buildDayAgenda`). Tasks have no per-item detail route yet, so they land
 * on the Tasks list rather than a dead link. */
function routeFor(item: AgendaItem): string | null {
  switch (item.type) {
    case 'commitment':
      return `/commitments/${item.sourceId}`;
    case 'habit':
      return `/habits/${item.sourceId}/edit`;
    case 'milestone':
      return `/goals/${item.sourceId}`;
    case 'task':
      return '/(tabs)/tasks';
    default:
      return null;
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Monday-start week containing `date`. */
function weekDaysFor(date: Date): Date[] {
  const day = date.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(startOfDay(date), mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export default function CalendarScreen() {
  const { t, i18n } = useTranslation();
  // formatWeekday/formatDate read i18next.language imperatively (not via a
  // hook), so on a cold direct load to this route they can capture the
  // language before it's settled and never re-run. Referencing i18n.language
  // here subscribes this component to react-i18next's languageChanged event,
  // forcing a re-render (and a fresh format*() call) once it's ready.
  void i18n.language;
  const router = useRouter();
  const openQuickCapture = useUiStore((s) => s.openQuickCapture);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));

  const week = useMemo(() => weekDaysFor(selectedDate), [selectedDate]);
  const { agenda, isLoading } = useDayAgenda(selectedDate);
  const items = agenda?.items ?? [];

  return (
    <>
      <ExpoStack.Screen options={{ headerShown: true, title: t('calendar.title'), presentation: 'card' }} />
      <AppScreen scrollable announceOnFocus="Calendar screen loaded">
        <YStack padding="$4" gap="$4" backgroundColor="$background">
          <XStack justifyContent="space-between" alignItems="center">
            <IconButton
              variant="ghost"
              iconToken={<ChevronLeft color="$contentPrimary" />}
              tooltipI18nKey="calendar.previousDay"
              onPress={() => setSelectedDate((d) => addDays(d, -1))}
            />
            <Body fontWeight="600">
              {formatWeekday(selectedDate)}, {formatDate(selectedDate)}
            </Body>
            <IconButton
              variant="ghost"
              iconToken={<ChevronRight color="$contentPrimary" />}
              tooltipI18nKey="calendar.nextDay"
              onPress={() => setSelectedDate((d) => addDays(d, 1))}
            />
          </XStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3" paddingHorizontal="$1">
              {week.map((day) => {
                const selected = isSameDay(day, selectedDate);
                return (
                  <YStack
                    key={day.toISOString()}
                    alignItems="center"
                    gap="$1"
                    onPress={() => setSelectedDate(startOfDay(day))}
                    pressStyle={{ opacity: 0.7 }}
                    {...toPlatformAccessibilityProps({
                      accessibilityRole: 'button',
                      accessibilityState: { selected },
                      accessibilityLabel: `${formatWeekday(day)}, ${formatDate(day)}`,
                    })}
                  >
                    <Body fontSize="$2" tone="secondary" textTransform="uppercase">
                      {formatWeekdayNarrow(day)}
                    </Body>
                    <Circle
                      size={36}
                      backgroundColor={selected ? '$accent' : 'transparent'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Body fontWeight="600" color={selected ? '$contentOnAccent' : '$contentPrimary'}>
                        {day.getDate()}
                      </Body>
                    </Circle>
                  </YStack>
                );
              })}
            </XStack>
          </ScrollView>

          {isLoading ? (
            <LoadingState fullscreen={false} title={{ i18nKey: 'calendar.loading' }} />
          ) : items.length === 0 ? (
            <EmptyState
              fullscreen={false}
              title={{ i18nKey: 'calendar.empty.title' }}
              description={{ i18nKey: 'calendar.empty.description' }}
            />
          ) : (
            <YStack gap="$3">
              {items.map((item) => {
                const route = routeFor(item);
                return (
                  <Card
                    key={item.id}
                    variant="elevated"
                    clickable={!!route}
                    onPress={route ? () => router.push(route as any) : undefined}
                    accessibilityLabel={t('calendar.itemA11y', { title: item.title, type: t(`calendar.types.${item.type}`) })}
                  >
                    <XStack gap="$3" alignItems="center">
                      <Circle size={10} backgroundColor={TYPE_DOT_COLOR[item.type] as any} />
                      <Body fontWeight="600" width={48} tone="secondary">
                        {item.time ?? ''}
                      </Body>
                      <Body
                        flex={1}
                        fontWeight="600"
                        textDecorationLine={item.completed ? 'line-through' : 'none'}
                      >
                        {item.title}
                      </Body>
                      {item.durationMinutes && (
                        <Body tone="secondary" fontSize="$2">
                          {t('calendar.durationMinutes', { count: item.durationMinutes })}
                        </Body>
                      )}
                    </XStack>
                  </Card>
                );
              })}
            </YStack>
          )}

          <Button
            variant="secondary"
            i18nKey="calendar.addActivity"
            iconStart={<Plus size={16} />}
            onPress={() => openQuickCapture('calendar')}
          />
        </YStack>
      </AppScreen>
    </>
  );
}
