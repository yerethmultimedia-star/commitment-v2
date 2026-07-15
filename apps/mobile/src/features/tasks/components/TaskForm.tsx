import { useState, useMemo } from 'react';
import { Text, YStack, Select, Adapt, Sheet, XStack, Button as TamaguiButton } from 'tamagui';
import { Title, Input, Button } from '@commitment/design-system';
import { useSession } from '@/core/auth/use-session';
import { tasksApi } from '../api/tasks.api';
import { TaskModel, TaskPriority } from '../models/task.model';
import { useTranslation } from 'react-i18next';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';

export function TaskForm({
  task,
  onSaved,
  onCancel
}: {
  task?: TaskModel;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const { identityId } = useSession();
  const { t } = useTranslation('tasks');
  const { data: commitments = [] } = useCommitments();

  const [title, setTitle] = useState(task?.title ?? '');
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [commitmentId, setCommitmentId] = useState<string>(task?.commitmentId ?? 'none');
  const [saving, setSaving] = useState(false);

  const titleError = titleTouched && !title.trim();

  const commitmentOptions = useMemo(() => {
    return [
      { value: 'none', label: t('form.noCommitment') },
      ...commitments.map(c => ({ value: c.id, label: c.title }))
    ];
  }, [commitments, t]);

  const selectedCommitmentLabel = useMemo(() => {
    const opt = commitmentOptions.find(o => o.value === commitmentId);
    return opt ? opt.label : t('form.noCommitment');
  }, [commitmentId, commitmentOptions, t]);

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
          commitmentId: commitmentId !== 'none' ? commitmentId : undefined
        });
      }

      setTitle('');
      setTitleTouched(false);
      setDescription('');
      setCommitmentId('none');
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
              accessibilityRole="button"
              accessibilityState={{ selected: priority === value }}
            >
              {t(`form.priority${value.charAt(0).toUpperCase() + value.slice(1)}`)}
            </TamaguiButton>
          ))}
        </XStack>
      </YStack>

      {!task && (
        <YStack gap="$1">
          <Text color="$contentSecondary" fontSize="$3" fontWeight="bold">{t('form.commitment')}</Text>
          <Select
            value={commitmentId}
            onValueChange={setCommitmentId}
            disablePreventBodyScroll
          >
            <Select.Trigger
              iconAfter={null}
              borderColor="$divider"
              focusStyle={{ borderColor: '$focus' }}
              accessibilityRole="button"
              accessibilityLabel={t('form.commitment')}
            >
              <Select.Value placeholder={t('form.noCommitment')}>
                {selectedCommitmentLabel}
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
                  <Select.Label>{t('form.commitment')}</Select.Label>
                  {commitmentOptions.map((item, i) => (
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
