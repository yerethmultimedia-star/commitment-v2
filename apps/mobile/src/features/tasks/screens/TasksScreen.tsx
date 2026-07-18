import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ScrollView, Theme, View, XStack, YStack } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { TaskForm } from '../components/TaskForm';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { useTaskActions, useTasks } from '../hooks/useTasks';
import { useTranslation } from 'react-i18next';
import { TaskModel } from '../models/task.model';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { IconButton, Card, Title, Body, Badge, BadgeTone, toPlatformAccessibilityProps, Portal } from '@commitment/design-system';
import { Plus } from '@tamagui/lucide-icons';
import { useUiStore } from '@/core/store/use-ui-store';
import { useAppearanceStore } from '@/features/appearance/store/use-appearance-store';

// Same three levels, same meaning, same tone mapping as Commitment's priority
// (see CommitmentPriorityBadge.tsx) — TECH_DEBT.md Item 38 (V-001): this used
// to hand-roll its own <Text> instead of reusing the shared Badge component.
const PRIORITY_TONE: Record<TaskModel['priority'], BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

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
  const themeId = useAppearanceStore((s) => s.appearance?.settings.themeId ?? 'DefaultLight');
  const { taskId: deepLinkedTaskId, prefillGoalId } = useLocalSearchParams<{ taskId?: string; prefillGoalId?: string }>();

  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [creatingWithGoalId, setCreatingWithGoalId] = useState<string | null>(null);
  const [bucket, setBucket] = useState<Bucket>('today');
  const consumedDeepLinkTaskId = useRef<string | null>(null);
  const consumedPrefillGoalId = useRef<string | null>(null);

  const handleSaved = () => {
    setEditingTask(null);
    setCreatingWithGoalId(null);
    refetch();
  };

  const handleCancel = () => {
    setEditingTask(null);
    setCreatingWithGoalId(null);
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

  // Deep link from Goal Workspace's "Add task" — opens the create form with
  // that Goal preloaded, mirroring the taskId deep-link above. Only
  // consumed once per goalId so cancelling doesn't immediately reopen it.
  useEffect(() => {
    if (!prefillGoalId || prefillGoalId === consumedPrefillGoalId.current) return;
    consumedPrefillGoalId.current = prefillGoalId;
    setEditingTask(null);
    setCreatingWithGoalId(prefillGoalId);
  }, [prefillGoalId]);

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

        {!editingTask && !creatingWithGoalId && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} marginBottom="$2">
            <XStack gap="$2" alignItems="center" paddingBottom="$3" borderBottomWidth={1} borderBottomColor="$divider">
              {BUCKETS.map((b) => (
                <Button
                  key={b}
                  size="$3"
                  theme={bucket === b ? 'active' : undefined}
                  onPress={() => setBucket(b)}
                  {...toPlatformAccessibilityProps({
                    accessibilityRole: 'button',
                    accessibilityState: { selected: bucket === b },
                  })}
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

        {!editingTask && creatingWithGoalId && (
          <TaskForm initialGoalId={creatingWithGoalId} onSaved={handleSaved} onCancel={handleCancel} />
        )}

        {isLoading ? (
          <Body tone="secondary">{t('loading')}</Body>
        ) : bucketTasks.length === 0 && !editingTask && !creatingWithGoalId ? (
          <EmptyState title={t(`buckets.empty.${bucket}.title`)} description={t(`buckets.empty.${bucket}.description`)} />
        ) : (
        bucketTasks.map(task => {
          const isTaskEditing = editingTask?.id === task.id;

          if (isTaskEditing) {
            return null; // Form is already shown at the top
          }

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
                <Badge
                  tone={PRIORITY_TONE[task.priority]}
                  i18nKey={`tasks:form.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`}
                />
              </XStack>

              <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                <TaskStatusBadge status={task.status} />

                <XStack gap="$2">
                  <Button
                    size="$2"
                    disabled={task.status === 'completed'}
                    onPress={() => complete.mutate(task.id)}
                    {...toPlatformAccessibilityProps({
                      accessibilityRole: 'button',
                      accessibilityLabel: t('actions.complete'),
                    })}
                  >
                    {t('actions.complete')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => setEditingTask(task)}
                    {...toPlatformAccessibilityProps({
                      accessibilityRole: 'button',
                      accessibilityLabel: t('actions.edit'),
                    })}
                  >
                    {t('actions.edit')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => duplicate.mutate(task.id)}
                    {...toPlatformAccessibilityProps({
                      accessibilityRole: 'button',
                      accessibilityLabel: t('actions.duplicate'),
                    })}
                  >
                    {t('actions.duplicate')}
                  </Button>
                  <Button
                    size="$2"
                    onPress={() => archive.mutate(task.id)}
                    {...toPlatformAccessibilityProps({
                      accessibilityRole: 'button',
                      accessibilityLabel: t('actions.archive'),
                    })}
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

      {!editingTask && !creatingWithGoalId && (
        // Rendered via Portal, not inline: a plain `position:absolute` +
        // `zIndex` here is trapped inside this ScrollView's own nested
        // stacking contexts on web and can never out-rank the FloatingTabBar
        // (a later, unrelated sibling rendered by (tabs)/_layout.tsx with no
        // stacking context of its own — DOM paint order alone lets it win
        // every hit-test in this corner, regardless of this z-index). Portal
        // escapes to the app-root-level PortalHost, the same mechanism
        // Dialog/BottomSheet/ActionSheet already rely on to render above
        // everything. Portal content sits outside AppearanceProvider's
        // `<Theme>` wrapper (TECH_DEBT Item 20), so the active experience
        // theme is re-applied explicitly here rather than silently falling
        // back to the default theme.
        <Portal>
          <Theme name={themeId as any}>
            <View position="absolute" bottom="$6" right="$6" zIndex={100}>
              <IconButton
                variant="primary"
                iconToken={<Plus color="$contentOnAccent" />}
                tooltipI18nKey="tasks:fab"
                accessibilityHintI18nKey="tasks:fabHint"
                onPress={() => openQuickCapture('tasks')}
              />
            </View>
          </Theme>
        </Portal>
      )}
    </View>
  );
}
