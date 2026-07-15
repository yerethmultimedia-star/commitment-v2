import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { TaskForm } from '../components/TaskForm';
import { useTaskActions, useTasks } from '../hooks/useTasks';
import { useTranslation } from 'react-i18next';
import { TaskModel } from '../models/task.model';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { IconButton, Card, Title, Body } from '@commitment/design-system';
import { Plus } from '@tamagui/lucide-icons';
import { useUiStore } from '@/core/store/use-ui-store';
import { PRIORITY_COLOR } from '../utils/task-descriptors';

type Bucket = 'inbox' | 'today' | 'upcoming' | 'completed' | 'archived';
const BUCKETS: Bucket[] = ['inbox', 'today', 'upcoming', 'completed', 'archived'];

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function bucketOf(task: TaskModel, todayEnd: Date): Bucket {
  if (task.status === 'completed') return 'completed';
  if (task.status === 'archived') return 'archived';
  if (!task.dueDate) return 'inbox';
  return new Date(task.dueDate) <= todayEnd ? 'today' : 'upcoming';
}

export function TasksScreen() {
  const { data: tasks = [], isLoading, refetch } = useTasks();
  const { t } = useTranslation('tasks');
  const { complete, archive, duplicate } = useTaskActions();
  const openQuickCapture = useUiStore((s) => s.openQuickCapture);
  const { taskId: deepLinkedTaskId } = useLocalSearchParams<{ taskId?: string }>();

  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [bucket, setBucket] = useState<Bucket>('today');
  const consumedDeepLinkTaskId = useRef<string | null>(null);

  const handleSaved = () => {
    setEditingTask(null);
    refetch();
  };

  const handleCancel = () => {
    setEditingTask(null);
  };

  const todayEnd = useMemo(() => endOfToday(), []);

  // Deep link from the Dashboard's priority-task hero card — opens that
  // specific task's edit form directly instead of leaving the user to find
  // it themselves. Only consumed once per taskId so cancelling the form
  // doesn't immediately reopen it.
  useEffect(() => {
    if (!deepLinkedTaskId || deepLinkedTaskId === consumedDeepLinkTaskId.current) return;
    const task = tasks.find((t) => t.id === deepLinkedTaskId);
    if (!task) return;
    consumedDeepLinkTaskId.current = deepLinkedTaskId;
    setBucket(bucketOf(task, todayEnd));
    setEditingTask(task);
  }, [deepLinkedTaskId, tasks, todayEnd]);

  const bucketCounts = useMemo(() => {
    const counts: Record<Bucket, number> = { inbox: 0, today: 0, upcoming: 0, completed: 0, archived: 0 };
    for (const task of tasks) counts[bucketOf(task, todayEnd)] += 1;
    return counts;
  }, [tasks, todayEnd]);

  const bucketTasks = useMemo(() => {
    return tasks
      .filter((task) => bucketOf(task, todayEnd) === bucket)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, todayEnd, bucket]);

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 12 }}>
        <Title fontSize="$7" fontWeight="700" marginBottom="$2">{t('title')}</Title>

        {!editingTask && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} marginBottom="$2">
            <XStack gap="$2" alignItems="center" paddingBottom="$3" borderBottomWidth={1} borderBottomColor="$divider">
              {BUCKETS.map((b) => (
                <Button
                  key={b}
                  size="$3"
                  theme={bucket === b ? 'active' : undefined}
                  onPress={() => setBucket(b)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: bucket === b }}
                >
                  {t(`buckets.${b}`)} ({bucketCounts[b]})
                </Button>
              ))}
            </XStack>
          </ScrollView>
        )}

        {editingTask && (
          <TaskForm task={editingTask} onSaved={handleSaved} onCancel={handleCancel} />
        )}

        {isLoading ? (
          <Body tone="secondary">{t('loading')}</Body>
        ) : bucketTasks.length === 0 && !editingTask ? (
          <EmptyState title={t(`buckets.empty.${bucket}.title`)} description={t(`buckets.empty.${bucket}.description`)} />
        ) : (
        bucketTasks.map(task => {
          const isTaskEditing = editingTask?.id === task.id;

          if (isTaskEditing) {
            return null; // Form is already shown at the top
          }

          const priorityColor = PRIORITY_COLOR[task.priority];

          return (
            <Card
              key={task.id}
              variant="elevated"
              gap="$2"
              opacity={task.status === 'completed' ? 0.6 : 1}
            >
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} gap="$1">
                  <Body fontWeight="700" fontSize="$5">{task.title}</Body>
                  {!!task.description && (
                    <Body tone="secondary" fontSize="$3">{task.description}</Body>
                  )}
                </YStack>
                <Text
                  fontSize="$2"
                  fontWeight="bold"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  backgroundColor={priorityColor.bg as any}
                  color={priorityColor.text as any}
                >
                  {t(`form.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                </Text>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                <Body tone="tertiary" fontSize="$2">
                  {t(`status.${task.status}`)}
                </Body>

                <XStack gap="$2">
                  <Button
                    size="$2"
                    disabled={task.status === 'completed'}
                    onPress={() => complete.mutate(task.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('actions.complete')}
                  >
                    {t('actions.complete')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => setEditingTask(task)}
                    accessibilityRole="button"
                    accessibilityLabel={t('actions.edit')}
                  >
                    {t('actions.edit')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => duplicate.mutate(task.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('actions.duplicate')}
                  >
                    {t('actions.duplicate')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => archive.mutate(task.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('actions.archive')}
                  >
                    {t('actions.archive')}
                  </Button>
                </XStack>
              </XStack>
            </Card>
          );
        })
        )}
      </ScrollView>

      {!editingTask && (
        <View position="absolute" bottom="$6" right="$6" zIndex={100}>
          <IconButton
            variant="primary"
            iconToken={<Plus color="$contentOnAccent" />}
            tooltipI18nKey="tasks:fab"
            accessibilityHintI18nKey="tasks:fabHint"
            onPress={() => openQuickCapture('tasks')}
          />
        </View>
      )}
    </View>
  );
}
