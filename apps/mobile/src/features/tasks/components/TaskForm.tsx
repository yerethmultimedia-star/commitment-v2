import { useState, useMemo } from 'react';
import { Text, YStack, Select, Adapt, Sheet, XStack, Button as TamaguiButton } from 'tamagui';
import { Title, Input, Button, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useSession } from '@/core/auth/use-session';
import { tasksApi } from '../api/tasks.api';
import { TaskModel, TaskPriority } from '../models/task.model';
import { useTranslation } from 'react-i18next';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useGoals } from '@/features/goals/hooks/useGoals';
import type { CommitmentModel } from '@/features/commitments/models/commitment.model';

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
  const [saving, setSaving] = useState(false);

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
        // Edit task title and description
        await tasksApi.edit(task.id, {
          title: title.trim(),
          description: description.trim() || undefined
        });

        // Edit priority if changed
        if (task.priority !== priority) {
          await tasksApi.changePriority(task.id, priority);
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
          commitmentId: relationKind === 'commitment' && relationTargetId ? relationTargetId : undefined,
          goalId: relationKind === 'goal' && relationTargetId ? relationTargetId : undefined,
        });
      }

      setTitle('');
      setTitleTouched(false);
      setDescription('');
      setRelationKind('none');
      setRelationTargetId('');
      setPriority('medium');
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <YStack gap="$3" padding="$4" backgroundColor="$surfaceRaised" borderRadius="$4">
      <Title fontSize="$5" fontWeight="bold">
        {task ? t('form.editTitle') : t('form.title')}
      </Title>

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

      <YStack gap="$1">
        <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{t('form.priority')}</Text>
        <XStack gap="$2">
          {(['low', 'medium', 'high'] as TaskPriority[]).map(value => (
            <TamaguiButton
              key={value}
              size="$2"
              theme={priority === value ? 'active' : undefined}
              onPress={() => setPriority(value)}
              flex={1}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected: priority === value },
              })}
            >
              {t(`form.priority${value.charAt(0).toUpperCase() + value.slice(1)}`)}
            </TamaguiButton>
          ))}
        </XStack>
      </YStack>

      <YStack gap="$1">
        <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{t('form.relatedTo')}</Text>
        <XStack gap="$2">
          {(['none', 'goal', 'commitment'] as RelationKind[]).map(kind => (
            <TamaguiButton
              key={kind}
              size="$2"
              theme={relationKind === kind ? 'active' : undefined}
              onPress={() => setRelationKindAndReset(kind)}
              flex={1}
              {...toPlatformAccessibilityProps({
                accessibilityRole: 'button',
                accessibilityState: { selected: relationKind === kind },
              })}
            >
              {t(`form.relatedTo${kind.charAt(0).toUpperCase() + kind.slice(1)}`)}
            </TamaguiButton>
          ))}
        </XStack>
      </YStack>

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
