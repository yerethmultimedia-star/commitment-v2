import { useState, useMemo } from 'react';
import { Button, Input, Label, Text, YStack, Select, Adapt, Sheet, XStack } from 'tamagui';
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
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [commitmentId, setCommitmentId] = useState<string>(task?.commitmentId ?? 'none');
  const [saving, setSaving] = useState(false);

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
      setDescription(''); 
      setCommitmentId('none');
      setPriority('medium');
      onSaved();
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <YStack gap="$3" padding="$4" backgroundColor="$backgroundElement" borderRadius="$4">
      <Text fontSize="$5" fontWeight="bold" color="$text">
        {task ? t('form.editTitle') : t('form.title')}
      </Text>

      <YStack gap="$1">
        <Label htmlFor="task-title" fontWeight="bold">{t('form.title')}</Label>
        <Input 
          id="task-title" 
          value={title} 
          onChangeText={setTitle} 
          placeholder={t('form.titlePlaceholder')} 
          accessibilityLabel={t('form.title')} 
        />
      </YStack>

      <YStack gap="$1">
        <Label fontWeight="bold">{t('form.description')}</Label>
        <Input 
          value={description} 
          onChangeText={setDescription} 
          placeholder={t('form.descriptionPlaceholder')} 
          accessibilityLabel={t('form.description')} 
        />
      </YStack>

      <YStack gap="$1">
        <Label fontWeight="bold">{t('form.priority')}</Label>
        <XStack gap="$2">
          {(['low', 'medium', 'high'] as TaskPriority[]).map(value => (
            <Button 
              key={value} 
              size="$2" 
              theme={priority === value ? 'active' : undefined} 
              onPress={() => setPriority(value)}
              flex={1}
            >
              {t(`form.priority${value.charAt(0).toUpperCase() + value.slice(1)}`)}
            </Button>
          ))}
        </XStack>
      </YStack>

      {!task && (
        <YStack gap="$1">
          <Label fontWeight="bold">{t('form.commitment')}</Label>
          <Select
            value={commitmentId}
            onValueChange={setCommitmentId}
            disablePreventBodyScroll
          >
            <Select.Trigger 
              iconAfter={null}
              borderColor="$borderColor"
              focusStyle={{ borderColor: '$blue10' }}
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
          <Button flex={1} onPress={onCancel}>
            {t('close')}
          </Button>
        )}
        <Button 
          theme="active" 
          disabled={!title.trim() || saving} 
          onPress={save}
          flex={1}
        >
          <Text color="white" fontWeight="bold">
            {saving ? '…' : (task ? t('form.save') : t('form.submit'))}
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
