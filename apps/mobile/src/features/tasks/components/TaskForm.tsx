import { useState, useMemo } from 'react';
import { Text, YStack, Select, Adapt, Sheet, XStack } from 'tamagui';
import { Input, Button, DurationInput, ChoiceGroup, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/core/auth/use-session';
import { queryKeys } from '@/core/query/query-keys';
import { tasksApi } from '../api/tasks.api';
import { TaskModel, TaskPriority } from '../models/task.model';
import { useTranslation } from 'react-i18next';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useGoals } from '@/features/goals/hooks/useGoals';
import type { CommitmentModel } from '@/features/commitments/models/commitment.model';
import { PlainDateTimePicker } from '@/shared/forms/PlainDateTimePicker';
import { mergeDateAndTime } from '@/shared/lib/mergeDateAndTime';
import { ReminderSection } from './ReminderSection';
import { useEntityReminder, useReminderStore } from '@/core/reminders/use-reminder-store';
import { DEFAULT_REMINDER_SETTINGS, ReminderSettings } from '@/core/reminders/reminder.types';

type RelationKind = 'none' | 'goal' | 'commitment';

function relationKindOf(task: Pick<TaskModel, 'goalId' | 'commitmentId'> | undefined): RelationKind {
  if (!task) return 'none';
  if (task.goalId) return 'goal';
  if (task.commitmentId) return 'commitment';
  return 'none';
}

export function TaskForm({
  task,
  initialGoalId,
  defaultRelationKind,
  commitmentOptions,
  onSaved,
  onCancel
}: {
  task?: TaskModel;
  /** Preloads the "Related to" selector to this Goal in create mode — e.g. arriving from Goal Workspace's "Add task". User-changeable, not locked in. */
  initialGoalId?: string;
  /**
   * ADR-022 §8 — Goal Workspace's Tasks tab creates Tasks scoped to the
   * Goal's own Commitments, not the Goal directly (Tasks tab is
   * Commitment-transitive, see GoalWorkspaceScreen.tsx). Overrides the
   * default "goal if initialGoalId else none" starting kind — still
   * user-changeable, not locked in.
   */
  defaultRelationKind?: RelationKind;
  /** Restricts the Commitment selector's options — e.g. to only a Goal's own linked Commitments, instead of every Commitment in the app. Falls back to useCommitments() when omitted. */
  commitmentOptions?: CommitmentModel[];
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const { identityId } = useSession();
  const { t } = useTranslation('tasks');
  const queryClient = useQueryClient();
  const { data: allCommitments = [] } = useCommitments();
  const commitments = commitmentOptions ?? allCommitments;
  const { data: goals = [] } = useGoals();

  const [title, setTitle] = useState(task?.title ?? '');
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const initialRelationKind = useMemo(
    () => task ? relationKindOf(task) : (defaultRelationKind ?? (initialGoalId ? 'goal' : 'none')),
    [task, initialGoalId, defaultRelationKind]
  );
  const [relationKind, setRelationKind] = useState<RelationKind>(initialRelationKind);
  const [relationTargetId, setRelationTargetId] = useState<string>(
    task?.goalId ?? task?.commitmentId ?? initialGoalId ?? ''
  );
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
  const dueDateHasTime = dueDate ? (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) : false;
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(
    task && task.estimatedMinutes > 0 ? task.estimatedMinutes : null
  );
  const [saving, setSaving] = useState(false);

  // Client-side-only reminder settings (see core/reminders) — an existing
  // task reads/writes the persisted store directly by id; a not-yet-created
  // task keeps its choice in local state until save() mints the real id.
  const existingReminder = useEntityReminder('task', task?.id);
  const [draftReminder, setDraftReminder] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const reminderValue = task ? (existingReminder.settings ?? DEFAULT_REMINDER_SETTINGS) : draftReminder;
  const setReminderValue = task ? existingReminder.setReminder : setDraftReminder;

  const titleError = titleTouched && !title.trim();

  // Goal and Commitment are mutually exclusive on a Task (see Task.relinkGoal
  // domain invariant) — one "Relacionado con" selector picks the kind, a
  // second dependent selector picks the specific Goal/Commitment, instead of
  // two selectors that could disagree with each other.
  const relationOptions = useMemo(() => {
    if (relationKind === 'goal') return goals.map(g => ({ value: g.id, label: g.title }));
    if (relationKind === 'commitment') return commitments.map(c => ({ value: c.id, label: c.title }));
    return [];
  }, [relationKind, goals, commitments]);

  const relationLabel = relationKind === 'goal' ? t('form.goal') : t('form.commitment');
  const relationPlaceholder = relationKind === 'goal' ? t('form.noGoal') : t('form.noCommitment');

  const selectedRelationLabel = useMemo(() => {
    const opt = relationOptions.find(o => o.value === relationTargetId);
    return opt ? opt.label : relationPlaceholder;
  }, [relationTargetId, relationOptions, relationPlaceholder]);

  const setRelationKindAndReset = (kind: RelationKind) => {
    setRelationKind(kind);
    setRelationTargetId(kind === initialRelationKind ? (task?.goalId ?? task?.commitmentId ?? initialGoalId ?? '') : '');
  };

  const save = async () => {
    setTitleTouched(true);
    if (!identityId || !title.trim()) return;
    setSaving(true);
    try {
      if (task) {
        // Edit task title, description, and estimated duration — the same
        // single command the domain's Task.edit() already accepts together
        // (see task_domain_review.md: estimatedMinutes was already wired
        // through EditTaskCommand, only the UI control was missing).
        await tasksApi.edit(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          estimatedMinutes: estimatedMinutes ?? undefined,
        });

        // Edit priority if changed
        if (task.priority !== priority) {
          await tasksApi.changePriority(task.id, priority);
        }

        // Reschedule if the due date changed — Task Capability Completion
        // Story 3, via the new ScheduleTaskCommand (previously impossible
        // after creation; see task_domain_review.md). startDate isn't
        // editable in this form yet (no UI for it) — pass the task's
        // current value through unchanged rather than omitting it, since
        // the backend resolves an omitted startDate to null (Story 6 fix).
        const originalDueDateISO = task.dueDate ?? null;
        const newDueDateISO = dueDate ? dueDate.toISOString() : null;
        if (newDueDateISO !== originalDueDateISO) {
          await tasksApi.schedule(task.id, newDueDateISO, task.startDate ?? null);
        }

        // Relink Goal/Commitment if the relation changed — fired after the
        // edits above, sequentially (never Promise.all): demo-mode
        // repositories do unlocked read-modify-write per call, so
        // concurrent mutations on the same task can silently lose one.
        const relationChanged =
          relationKind !== initialRelationKind ||
          relationTargetId !== (task.goalId ?? task.commitmentId ?? '');
        if (relationChanged) {
          if (relationKind === 'goal') {
            await tasksApi.relinkGoal(task.id, relationTargetId || null);
          } else if (relationKind === 'commitment') {
            await tasksApi.relinkCommitment(task.id, relationTargetId || null);
          } else if (initialRelationKind === 'goal') {
            await tasksApi.relinkGoal(task.id, null);
          } else if (initialRelationKind === 'commitment') {
            await tasksApi.relinkCommitment(task.id, null);
          }
        }
      } else {
        // Generate ID safely
        let uuid = 'task-id';
        try {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            uuid = crypto.randomUUID();
          } else {
            uuid = Math.random().toString(36).substring(2) + Date.now().toString(36);
          }
        } catch (e) {}

        await tasksApi.create({
          id: uuid,
          identityId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          estimatedMinutes: estimatedMinutes ?? undefined,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          commitmentId: relationKind === 'commitment' && relationTargetId ? relationTargetId : undefined,
          goalId: relationKind === 'goal' && relationTargetId ? relationTargetId : undefined,
        });

        if (draftReminder.enabled) {
          useReminderStore.getState().setReminder('task', uuid, draftReminder);
        }
      }

      // Found live while verifying Story 1 (estimatedMinutes): this save
      // path called tasksApi.* directly, bypassing useTaskActions()'s own
      // mutations entirely, so nothing ever invalidated the cache after an
      // edit — Detail kept showing pre-edit data for up to the query
      // client's 5-minute default staleTime. Mirrors useTaskActions()'s own
      // invalidate() shape (tasks + commitments, since relinking/priority
      // changes affect Commitment-scoped views too).
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.commitments.all }),
      ]);

      setTitle('');
      setTitleTouched(false);
      setDescription('');
      setRelationKind('none');
      setRelationTargetId('');
      setPriority('medium');
      setDueDate(null);
      setEstimatedMinutes(null);
      setDraftReminder(DEFAULT_REMINDER_SETTINGS);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <YStack gap="$3" padding="$4" backgroundColor="$surfaceRaised" borderRadius="$4">
      <Input
        value={title}
        onChangeText={setTitle}
        onBlur={() => setTitleTouched(true)}
        labelI18nKey="tasks:form.title"
        placeholderI18nKey="tasks:form.titlePlaceholder"
        error={titleError}
        helperI18nKey={titleError ? 'tasks:form.titleRequired' : undefined}
      />

      <Input
        value={description}
        onChangeText={setDescription}
        labelI18nKey="tasks:form.description"
        placeholderI18nKey="tasks:form.descriptionPlaceholder"
      />

      {
        // Task Capability Completion Story 3 — editable in both create and
        // edit mode now that ScheduleTaskCommand exposes Task.schedule()
        // (previously edit-mode showed this read-only, since the real
        // backend had no command wired to change it after creation).
        //
        // App-wide UX rule: date and time are always two independent
        // fields, never one combined picker — the user decides the day
        // first, then (optionally) the time, and can change either without
        // touching the other. Both map onto the same dueDate (verified to
        // already be a full instant, no midnight normalization anywhere in
        // the domain — no new attribute here). The Hora field is disabled
        // until a Fecha exists (a time needs a day to attach to) and shows
        // its placeholder rather than "12:00 AM" whenever dueDate has no
        // explicit time component yet, using the same "date-only, no real
        // time" heuristic Calendar's isoTime() already uses.
      }
      <PlainDateTimePicker
        value={dueDate}
        onChange={(date) => setDueDate(mergeDateAndTime(dueDate, date, 'date'))}
        labelI18nKey={t('form.dueDate')}
        placeholderI18nKey={t('form.dueDatePlaceholder')}
        mode="date"
      />
      <PlainDateTimePicker
        value={dueDateHasTime ? dueDate : null}
        onChange={(date) => setDueDate(mergeDateAndTime(dueDate, date, 'time'))}
        labelI18nKey={t('form.dueTime')}
        placeholderI18nKey={t('form.dueTimePlaceholder')}
        mode="time"
        disabled={!dueDate}
      />

      <ChoiceGroup
        label={t('form.priority')}
        options={['low', 'medium', 'high'] as TaskPriority[]}
        isSelected={(p) => priority === p}
        onSelect={setPriority}
        labelFor={(p) => t(`form.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)}
        stretch
      />

      <DurationInput value={estimatedMinutes} onChange={setEstimatedMinutes} />

      <ReminderSection value={reminderValue} onChange={setReminderValue} dueDate={dueDate} />

      <ChoiceGroup
        label={t('form.relatedTo')}
        options={['none', 'goal', 'commitment'] as RelationKind[]}
        isSelected={(kind) => relationKind === kind}
        onSelect={setRelationKindAndReset}
        labelFor={(kind) => t(`form.relatedTo${kind.charAt(0).toUpperCase() + kind.slice(1)}`)}
        stretch
      />

      {relationKind !== 'none' && (
        <YStack gap="$1">
          <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{relationLabel}</Text>
          <Select
            key={relationKind}
            value={relationTargetId}
            onValueChange={setRelationTargetId}
            disablePreventBodyScroll
          >
            <Select.Trigger
              iconAfter={null}
              borderColor="$divider"
              focusStyle={{ borderColor: '$focus' }}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityLabel: relationLabel,
              })}
            >
              <Select.Value placeholder={relationPlaceholder}>
                {selectedRelationLabel}
              </Select.Value>
            </Select.Trigger>

            <Adapt platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>

            <Select.Content>
              <Select.Viewport minWidth={200}>
                <Select.Group>
                  <Select.Label>{relationLabel}</Select.Label>
                  {relationOptions.map((item, i) => (
                    <Select.Item index={i} key={item.value} value={item.value}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>
      )}

      <XStack gap="$2" marginTop="$2">
        {onCancel && (
          <XStack flex={1}>
            <Button variant="outline" i18nKey="tasks:close" onPress={onCancel} fullWidth />
          </XStack>
        )}
        <XStack flex={1}>
          <Button
            variant="primary"
            i18nKey={task ? 'tasks:form.save' : 'tasks:form.submit'}
            disabled={!title.trim()}
            loading={saving}
            onPress={save}
            fullWidth
          />
        </XStack>
      </XStack>
    </YStack>
  );
}
