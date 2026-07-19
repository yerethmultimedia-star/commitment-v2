import { useTranslation } from 'react-i18next';
import { YStack, ScrollView } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Title, Button, LoadingState, ErrorState } from '@commitment/design-system';
import { useTask } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';

/**
 * Task field editing — reached only via the explicit "Editar" entry in
 * TaskDetailScreen's overflow menu, never as the default result of tapping
 * a task in a list (List -> Detail -> Edit, mirroring EditHabitScreen.tsx).
 * TaskForm itself is unchanged — this route just gives it a standalone
 * screen instead of rendering inline inside TasksScreen, consistent with
 * Habit's own Detail/Edit split.
 */
export function EditTaskScreen() {
  const { t } = useTranslation('tasks');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: task, isLoading, isError, refetch } = useTask(id);

  if (isLoading) return <LoadingState title={{ i18nKey: 'tasks:detail.loading' }} />;
  if (isError || !task) {
    return (
      <ErrorState
        title={{ i18nKey: 'tasks:detail.error.title' }}
        primaryAction={<Button variant="primary" onPress={refetch} i18nKey="tasks:detail.error.retry" />}
      />
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('form.editTitle') }} />
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$5" paddingBottom="$10">
          <Title fontSize="$7" fontWeight="bold">{task.title}</Title>
          <TaskForm task={task} onSaved={() => router.back()} onCancel={() => router.back()} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
