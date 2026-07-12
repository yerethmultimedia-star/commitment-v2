import { useState } from 'react';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';
import { TaskForm } from '../components/TaskForm';
import { useTaskActions, useTasks } from '../hooks/useTasks';
import { useTranslation } from 'react-i18next';
import { TaskModel } from '../models/task.model';

export function TasksScreen() {
  const { data: tasks = [], isLoading, refetch } = useTasks();
  const { t } = useTranslation('tasks');
  const { complete, archive, duplicate } = useTaskActions();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [sortBy, setSortBy] = useState<'created' | 'priority'>('created');

  const handleSaved = () => {
    setShowForm(false);
    setEditingTask(null);
    refetch();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
        <Text fontSize="$7" fontWeight="700" color="$text">{t('title')}</Text>
        {!editingTask && (
          <Button onPress={() => setShowForm(value => !value)}>
            {showForm ? t('close') : t('new')}
          </Button>
        )}
      </XStack>

      {!editingTask && (
        <XStack gap="$2" alignItems="center" marginBottom="$2" paddingBottom="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
          <Text color="$textSecondary" fontSize="$3">{t('form.sortBy')}:</Text>
          <Button 
            size="$2" 
            theme={sortBy === 'created' ? 'active' : undefined} 
            onPress={() => setSortBy('created')}
          >
            {t('form.sortCreated')}
          </Button>
          <Button 
            size="$2" 
            theme={sortBy === 'priority' ? 'active' : undefined} 
            onPress={() => setSortBy('priority')}
          >
            {t('form.sortPriority')}
          </Button>
        </XStack>
      )}

      {showForm && !editingTask && (
        <TaskForm onSaved={handleSaved} onCancel={handleCancel} />
      )}

      {editingTask && (
        <TaskForm task={editingTask} onSaved={handleSaved} onCancel={handleCancel} />
      )}

      {isLoading ? (
        <Text color="$textSecondary">{t('loading')}</Text>
      ) : sortedTasks.length === 0 ? (
        <Text color="$textTertiary">{t('empty')}</Text>
      ) : (
        sortedTasks.map(task => {
          const isTaskEditing = editingTask?.id === task.id;
          
          if (isTaskEditing) {
            return null; // Form is already shown at the top
          }

          return (
            <YStack 
              key={task.id} 
              gap="$2" 
              padding="$4" 
              borderRadius="$4" 
              backgroundColor="$backgroundElement" 
              opacity={task.status === 'completed' ? 0.6 : 1}
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} gap="$1">
                  <Text fontWeight="700" fontSize="$5" color="$text">{task.title}</Text>
                  {!!task.description && (
                    <Text color="$textSecondary" fontSize="$3">{task.description}</Text>
                  )}
                </YStack>
                <Text 
                  fontSize="$2" 
                  fontWeight="bold" 
                  paddingHorizontal="$2" 
                  paddingVertical="$1" 
                  borderRadius="$2"
                  backgroundColor={
                    task.priority === 'high' 
                      ? '$red3' 
                      : task.priority === 'medium' 
                        ? '$orange3' 
                        : '$gray3'
                  }
                  color={
                    task.priority === 'high' 
                      ? '$red10' 
                      : task.priority === 'medium' 
                        ? '$orange10' 
                        : '$gray10'
                  }
                >
                  {t(`form.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                </Text>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                <Text color="$textTertiary" fontSize="$2">
                  {task.status.toUpperCase()}
                </Text>
                
                <XStack gap="$2">
                  <Button 
                    size="$2" 
                    disabled={task.status === 'completed'} 
                    onPress={() => complete.mutate(task.id)}
                  >
                    {t('actions.complete')}
                  </Button>
                  <Button 
                    size="$2" 
                    onPress={() => setEditingTask(task)}
                  >
                    {t('actions.edit')}
                  </Button>
                  <Button 
                    size="$2" 
                    onPress={() => duplicate.mutate(task.id)}
                  >
                    {t('actions.duplicate')}
                  </Button>
                  <Button 
                    size="$2" 
                    onPress={() => archive.mutate(task.id)}
                  >
                    {t('actions.archive')}
                  </Button>
                </XStack>
              </XStack>
            </YStack>
          );
        })
      )}
    </ScrollView>
  );
}
