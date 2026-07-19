import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { YStack, XStack, ScrollView } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MoreVertical, Flag, CalendarClock, Bell, Clock, Target, Handshake } from '@tamagui/lucide-icons';
import {
  Title, Body, Button, Card, IconButton, ActionSheet, ConfirmationDialog,
  LoadingState, ErrorState,
} from '@commitment/design-system';
import { useTask, useTaskActions } from '../hooks/useTasks';
import { useTaskActionDispatch } from '../hooks/useTaskActionDispatch';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { ReminderSection } from '../components/ReminderSection';
import { useEntityReminder } from '@/core/reminders/use-reminder-store';
import { DEFAULT_REMINDER_SETTINGS } from '@/core/reminders/reminder.types';
import { getAllowedTaskActions, isTaskEditable } from '@/shared/domain/taskActions';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { dateFormatter } from '@/shared/lib/dateFormatter';

const PRIORITY_COLOR: Record<string, string> = { low: '$contentSecondary', medium: '$warning', high: '$danger' };

/**
 * Task's read-only Detail — Stabilization Sprint "Task UX Redesign" round.
 * Same List -> Detail -> Edit shape as Habit's own Detail (see
 * HabitDetailScreen.tsx's doc comment): the information view is not the
 * edit form, and Edit is always an explicit action, never the default
 * result of tapping a task.
 *
 * Primary/secondary buttons are derived from getAllowedTaskActions()'s own
 * `variant: 'primary'` tagging (never a hardcoded per-status branch, per
 * ADR-022 §4.2's rule) — whatever the domain currently allows as a primary
 * move surfaces here; everything else (secondary-variant transitions, plus
 * Edit/Duplicate) lives in the overflow ActionSheet.
 */
export function TaskDetailScreen() {
  const { t } = useTranslation('tasks');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: task, isLoading, isError, refetch } = useTask(id);
  const { data: goals = [] } = useGoals();
  const { data: commitments = [] } = useCommitments();
  const { duplicate } = useTaskActions();
  const { confirming, setConfirming, handleAction, executeAction, pendingActionFor } = useTaskActionDispatch();
  const [overflowOpen, setOverflowOpen] = useState(false);

  const reminder = useEntityReminder('task', task?.id);
  const reminderSettings = reminder.settings ?? DEFAULT_REMINDER_SETTINGS;

  const linkedGoalTitle = useMemo(
    () => (task?.goalId ? goals.find((g) => g.id === task.goalId)?.title : undefined),
    [goals, task?.goalId],
  );
  const linkedCommitmentTitle = useMemo(
    () => (task?.commitmentId ? commitments.find((c) => c.id === task.commitmentId)?.title : undefined),
    [commitments, task?.commitmentId],
  );

  if (isLoading) return <LoadingState title={{ i18nKey: 'tasks:detail.loading' }} />;
  if (isError || !task) {
    return (
      <ErrorState
        title={{ i18nKey: 'tasks:detail.error.title' }}
        primaryAction={<Button variant="primary" onPress={refetch} i18nKey="tasks:detail.error.retry" />}
      />
    );
  }

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  // Story 3+ due-date exposure — dueDate has always carried a real time
  // component in the domain, but nothing set one until the form's picker
  // moved to mode="datetime". Only show it when it's not midnight, mirroring
  // Calendar's own isoTime() "date-only, no real time" convention, so
  // existing midnight-default tasks don't display a misleading "00:00".
  const dueDateHasTime = dueDate ? (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) : false;
  const allowedActions = getAllowedTaskActions(task.status, task.blockedType);
  const primaryVariantActions = allowedActions.filter((a) => a.variant === 'primary');
  const overflowLifecycleActions = allowedActions.filter((a) => a.variant !== 'primary');
  const editable = isTaskEditable(task.status);

  const overflowActions = [
    ...(editable ? [{ labelI18nKey: 'tasks:actions.edit', onPress: () => router.push(`/tasks/${id}/edit` as any) }] : []),
    { labelI18nKey: 'tasks:actions.duplicate', onPress: () => duplicate.mutate(task.id, { onSuccess: () => router.back() }) },
    ...overflowLifecycleActions.map((action) => ({
      labelI18nKey: `tasks:${action.labelKey}`,
      destructive: action.destructive,
      onPress: () => handleAction(task, action),
    })),
  ];

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen
        options={{
          title: task.title,
          headerRight: () => (
            <IconButton
              variant="ghost"
              size={20}
              iconToken={<MoreVertical />}
              tooltipI18nKey="tasks:detail.moreActions"
              accessibilityHintI18nKey="tasks:detail.moreActions"
              onPress={() => setOverflowOpen(true)}
            />
          ),
        }}
      />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          <YStack gap="$2">
            <Title fontSize="$7" fontWeight="bold">{task.title}</Title>
            <XStack>
              <TaskStatusBadge status={task.status} />
            </XStack>
          </YStack>

          <Card variant="elevated" padding={0} overflow="hidden">
            <InfoRow icon={<Flag size={18} color={PRIORITY_COLOR[task.priority]} />} label={t('detail.priority')}>
              {t(`form.priority${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)}`)}
            </InfoRow>
            <InfoRow icon={<CalendarClock size={18} color="$contentSecondary" />} label={t('detail.dueDate')} divider>
              {dueDate ? dateFormatter.formatDate(dueDate) : t('detail.noDueDate')}
            </InfoRow>
            {
              // App-wide UX rule: date and time are always shown as
              // independent attributes, never combined into one label —
              // and this row is never hidden, even when there's no time
              // set, so the user can see explicitly *why* a task isn't
              // sorted by time in Calendar (see calendar.tsx's "Sin hora"
              // section) rather than wondering if the app forgot it.
            }
            <InfoRow icon={<Clock size={18} color="$contentSecondary" />} label={t('detail.dueTime')} divider>
              {dueDateHasTime && dueDate ? dateFormatter.formatTime(dueDate) : t('detail.dueTimeNotSet')}
            </InfoRow>
            <InfoRow icon={<Bell size={18} color="$contentSecondary" />} label={t('detail.reminder')} divider>
              {reminderSettings.enabled ? t('detail.reminderOn') : t('detail.reminderOff')}
            </InfoRow>
            {task.estimatedMinutes > 0 && (
              <InfoRow icon={<Clock size={18} color="$contentSecondary" />} label={t('detail.estimatedTime')} divider>
                {t('detail.minutes', { count: task.estimatedMinutes })}
              </InfoRow>
            )}
            {linkedGoalTitle && (
              <InfoRow icon={<Target size={18} color="$contentSecondary" />} label={t('detail.goal')} divider>
                {linkedGoalTitle}
              </InfoRow>
            )}
            {linkedCommitmentTitle && (
              <InfoRow icon={<Handshake size={18} color="$contentSecondary" />} label={t('detail.commitment')} divider>
                {linkedCommitmentTitle}
              </InfoRow>
            )}
          </Card>

          {!!task.description && (
            <YStack gap="$1">
              <Body tone="secondary" fontSize="$3" fontWeight="bold">{t('detail.description')}</Body>
              <Body fontSize="$4">{task.description}</Body>
            </YStack>
          )}

          <ReminderSection value={reminderSettings} onChange={reminder.setReminder} dueDate={dueDate} />

          {primaryVariantActions.length > 0 && (
            <XStack gap="$2">
              {primaryVariantActions.map((action, i) => (
                <XStack key={action.id} flex={1}>
                  <Button
                    variant={i === 0 ? 'primary' : 'secondary'}
                    fullWidth
                    loading={pendingActionFor(task.id) === action.id}
                    disabled={pendingActionFor(task.id) != null}
                    i18nKey={`tasks:${action.labelKey}`}
                    onPress={() => handleAction(task, action)}
                  />
                </XStack>
              ))}
            </XStack>
          )}
        </YStack>
      </ScrollView>

      <ActionSheet open={overflowOpen} onOpenChange={setOverflowOpen} actions={overflowActions} />

      {confirming && (
        <ConfirmationDialog
          open={true}
          onOpenChange={(open) => { if (!open) setConfirming(null); }}
          titleI18nKey={`tasks:confirm.${confirming.action.id}.title`}
          descriptionI18nKey={`tasks:confirm.${confirming.action.id}.description`}
          descriptionI18nParams={{ title: confirming.task.title }}
          confirmI18nKey={`tasks:${confirming.action.labelKey}`}
          cancelI18nKey="cancel"
          destructive={confirming.action.destructive}
          onConfirm={() => executeAction(confirming.task, confirming.action)}
        />
      )}
    </YStack>
  );
}

function InfoRow({ icon, label, children, divider }: { icon: React.ReactNode; label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      justifyContent="space-between"
      alignItems="center"
      borderTopWidth={divider ? 1 : 0}
      borderTopColor="$divider"
    >
      <XStack gap="$3" alignItems="center">
        {icon}
        <Body fontSize="$4">{label}</Body>
      </XStack>
      <Body fontSize="$4" tone="secondary">{children}</Body>
    </XStack>
  );
}
