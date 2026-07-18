import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack as ExpoStack } from 'expo-router';
import { YStack, XStack, Circle } from 'tamagui';
import {
  CheckCircle2, Circle as CircleIcon, StickyNote, Paperclip, History, ListChecks, Repeat, Clock, Plus, Target,
  Pencil, Archive as ArchiveIcon,
} from '@tamagui/lucide-icons';
import {
  AppScreen, Card, Body, Title, IconButton, Button,
  ProgressMetric, MetricCard, SectionHeader, LoadingState, ConfirmationDialog, EmptyState,
} from '@commitment/design-system';
import { formatDate } from '@commitment/localization';
import { useRouter } from 'expo-router';
import { useToggleMilestone, useRenameGoal, useUpdateGoalDescription, useActivateGoal, useCompleteGoal, useArchiveGoal } from '../hooks/useGoals';
import { useGoalWorkspace } from '../hooks/useGoalsView';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useHabits, useToggleHabit } from '@/features/habits/hooks/useHabits';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { CommitmentStatusBadge } from '@/features/commitments/components/CommitmentStatusBadge';
import { GoalTabStrip } from '../components/GoalTabStrip';
import { RenameGoalDialog } from '../components/RenameGoalDialog';

export interface GoalWorkspaceScreenProps {
  goalId: string;
}

type WorkspaceTab = 'summary' | 'tasks' | 'milestones' | 'notes';
const TABS: WorkspaceTab[] = ['summary', 'tasks', 'milestones', 'notes'];

function progressDescriptionKey(progress: number): string {
  if (progress >= 0.7) return 'goals.workspace.progressDescription.great';
  if (progress >= 0.35) return 'goals.workspace.progressDescription.good';
  return 'goals.workspace.progressDescription.starting';
}

export function GoalWorkspaceScreen({ goalId }: GoalWorkspaceScreenProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: goal, isLoading } = useGoalWorkspace(goalId);
  const { data: commitments = [] } = useCommitments();
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const toggleHabit = useToggleHabit();
  const toggleMilestone = useToggleMilestone();
  const renameGoal = useRenameGoal();
  const updateGoalDescription = useUpdateGoalDescription();
  const activateGoal = useActivateGoal();
  const completeGoal = useCompleteGoal();
  const archiveGoal = useArchiveGoal();
  const [tab, setTab] = useState<WorkspaceTab>('summary');
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmingActivate, setConfirmingActivate] = useState(false);
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  // Commitment doesn't own this relationship (TECH_DEBT.md Item 10, Fase 4B) —
  // Goal.commitmentIds[] is the source of truth, not Commitment.goalId (which
  // doesn't exist on the real backend). Habit DOES own its Goal relationship
  // (Habit.goalId, real and working — see the Relationship Ownership
  // Assessment candidate), so linkedHabits keeps filtering on the Habit side.
  const linkedCommitments = useMemo(
    () => commitments.filter((c) => goal?.commitmentIds.includes(c.id) ?? false),
    [commitments, goal]
  );
  const linkedHabits = useMemo(
    () => habits.filter((h) => h.goalId === goalId),
    [habits, goalId]
  );
  const linkedTasks = useMemo(
    () => tasks.filter((tk) =>
      tk.goalId === goalId ||
      (tk.commitmentId && goal?.commitmentIds.includes(tk.commitmentId))
    ),
    [tasks, goal, goalId]
  );
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return linkedTasks
      .filter((tk) => tk.status === 'pending' && tk.dueDate && new Date(tk.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [linkedTasks]);

  const stats = useMemo(() => {
    const completedTasks = linkedTasks.filter((tk) => tk.status === 'completed').length;
    const avgStreak = linkedHabits.length > 0
      ? Math.round(linkedHabits.reduce((sum, h) => sum + h.currentStreakDays, 0) / linkedHabits.length)
      : 0;
    const completedMilestones = goal?.milestones.filter((m) => m.completed).length ?? 0;
    return {
      totalTasks: linkedTasks.length,
      completedTasks,
      avgStreak,
      completedMilestones,
      totalMilestones: goal?.milestones.length ?? 0,
    };
  }, [linkedTasks, linkedHabits, goal]);

  if (isLoading || !goal) {
    return (
      <AppScreen scrollable>
        <LoadingState fullscreen={false} title={{ i18nKey: 'goals.workspace.loading' }} />
      </AppScreen>
    );
  }

  return (
    <>
      <ExpoStack.Screen options={{ headerShown: true, title: goal.title, presentation: 'card' }} />
      <AppScreen scrollable announceOnFocus="Goal workspace loaded">
        <YStack padding="$4" gap="$4" backgroundColor="$background">
          <XStack gap="$3" alignItems="center">
            <Circle size={40} backgroundColor="$focus" justifyContent="center" alignItems="center">
              <Target color="$accent" size={20} />
            </Circle>
            <Title flex={1} fontSize="$6" numberOfLines={2}>{goal.title}</Title>
            <IconButton
              iconToken={<Pencil size={18} />}
              tooltipI18nKey="goals.workspace.editTitleTooltip"
              accessibilityHintI18nKey="goals.workspace.editTitleTooltip"
              onPress={() => setRenameOpen(true)}
            />
          </XStack>

          <GoalTabStrip tabs={TABS} active={tab} onChange={setTab} labelFor={(tb) => t(`goals.workspace.tabs.${tb}`)} />

          {tab === 'summary' && (
            <YStack gap="$5">
              <Card variant="elevated">
                <XStack gap="$4" alignItems="center">
                  <ProgressMetric progress={goal.progress} size="medium" />
                  <YStack flex={1} gap="$1">
                    <Body tone="secondary" fontSize="$2" textTransform="uppercase" fontWeight="600">
                      {t('goals.workspace.progressLabel')}
                    </Body>
                    <Body fontWeight="600">{t(progressDescriptionKey(goal.progress))}</Body>
                  </YStack>
                </XStack>
              </Card>

              {goal.description ? (
                <Body tone="secondary">{goal.description}</Body>
              ) : null}

              {goal.targetDate && (
                <YStack gap="$2">
                  <Card variant="elevated">
                    <XStack justifyContent="space-between">
                      <Body tone="secondary">{t('goals.workspace.dueDate')}</Body>
                      <Body fontWeight="600">{formatDate(goal.targetDate)}</Body>
                    </XStack>
                  </Card>
                </YStack>
              )}

              <YStack gap="$2">
                <SectionHeader title={{ i18nKey: 'goals.workspace.statistics' }} />
                <XStack gap="$3" flexWrap="wrap">
                  <YStack flex={1} minWidth={100}>
                    <MetricCard icon={<ListChecks color="$accent" size={20} />} i18nKey="goals.workspace.stats.tasks" value={`${stats.completedTasks}/${stats.totalTasks}`} />
                  </YStack>
                  <YStack flex={1} minWidth={100}>
                    <MetricCard icon={<Repeat color="$accent" size={20} />} i18nKey="goals.workspace.stats.avgStreak" value={t('goals.workspace.stats.days', { count: stats.avgStreak })} />
                  </YStack>
                  <YStack flex={1} minWidth={100}>
                    <MetricCard icon={<CheckCircle2 color="$accent" size={20} />} i18nKey="goals.workspace.stats.milestones" value={`${stats.completedMilestones}/${stats.totalMilestones}`} />
                  </YStack>
                </XStack>
              </YStack>

              {/* Decisión B, Goal Lifecycle: Draft can activate or archive,
                  but not complete directly — it must go through Active
                  first (Goal.activate()'s domain invariants). */}
              {(goal.state === 'Active' || goal.state === 'Draft') && (
                <XStack gap="$3">
                  <YStack flex={1}>
                    {goal.state === 'Draft' ? (
                      <Button
                        variant="primary"
                        fullWidth
                        i18nKey="goals.workspace.activate"
                        loading={activateGoal.isPending}
                        onPress={() => setConfirmingActivate(true)}
                      />
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        i18nKey="goals.workspace.complete"
                        loading={completeGoal.isPending}
                        onPress={() => setConfirmingComplete(true)}
                      />
                    )}
                  </YStack>
                  <YStack flex={1}>
                    <Button
                      variant="outline"
                      fullWidth
                      i18nKey="goals.workspace.archive"
                      loading={archiveGoal.isPending}
                      onPress={() => setConfirmingArchive(true)}
                    />
                  </YStack>
                </XStack>
              )}
            </YStack>
          )}

          {tab === 'tasks' && (
            <YStack gap="$5">
              <YStack gap="$2">
                <SectionHeader
                  title={{ i18nKey: 'goals.workspace.commitments' }}
                  action={
                    <IconButton
                      iconToken={<Plus size={18} />}
                      tooltipI18nKey="goals.workspace.addCommitment"
                      accessibilityHintI18nKey="goals.workspace.addCommitment"
                      onPress={() => router.push(`/commitments/create?goalId=${goal.id}` as any)}
                    />
                  }
                />
                {linkedCommitments.length > 0 && (
                  <YStack gap="$2">
                    {linkedCommitments.map((c) => (
                      <Card
                        key={c.id}
                        variant="elevated"
                        clickable
                        onPress={() => router.push(`/commitments/${c.id}` as any)}
                        pressStyle={{ opacity: 0.9 }}
                        accessibilityLabel={c.title}
                      >
                        <XStack justifyContent="space-between" alignItems="center" gap="$2">
                          <Body flex={1} fontWeight="600">{c.title}</Body>
                          <CommitmentStatusBadge status={c.status} />
                        </XStack>
                      </Card>
                    ))}
                  </YStack>
                )}
              </YStack>

              <YStack gap="$2">
                <SectionHeader
                  title={{ i18nKey: 'goals.workspace.habits' }}
                  action={
                    <IconButton
                      iconToken={<Plus size={18} />}
                      tooltipI18nKey="goals.workspace.addHabit"
                      accessibilityHintI18nKey="goals.workspace.addHabit"
                      onPress={() => router.push(`/habits/create?goalId=${goal.id}` as any)}
                    />
                  }
                />
                {linkedHabits.length > 0 && (
                  <YStack gap="$2">
                    {linkedHabits.map((h) => (
                      <HabitCard
                        key={h.id}
                        habit={h}
                        onToggle={() => toggleHabit.mutate({ id: h.id, completedToday: h.completedToday })}
                        onPress={() => router.push(`/habits/${h.id}/edit` as any)}
                      />
                    ))}
                  </YStack>
                )}
              </YStack>

              <YStack gap="$2">
                <SectionHeader
                  title={{ i18nKey: 'goals.workspace.upcoming' }}
                  action={
                    <IconButton
                      iconToken={<Plus size={18} />}
                      tooltipI18nKey="goals.workspace.addTask"
                      accessibilityHintI18nKey="goals.workspace.addTask"
                      onPress={() => router.push(`/(tabs)/tasks?prefillGoalId=${goal.id}` as any)}
                    />
                  }
                />
                {upcomingTasks.length === 0 ? (
                  <EmptyState
                    fullscreen={false}
                    icon={<Clock color="$contentTertiary" size={32} />}
                    title={{ i18nKey: 'goals.workspace.upcomingEmpty' }}
                  />
                ) : (
                  <YStack gap="$2">
                    {upcomingTasks.map((tk) => (
                      // Navigates to the Tasks screen (Task has no per-item detail
                      // route anywhere in the app) rather than exposing an inline
                      // action here — matches the entity's own summary-card
                      // pattern already established by UpcomingTasksWidget on
                      // Today, and the "summary cards lead to the entity's main
                      // surface" rule Commitment's own card in this same tab
                      // already follows (TECH_DEBT.md B-001, VS-037).
                      <Card
                        key={tk.id}
                        variant="elevated"
                        clickable
                        onPress={() => router.push('/(tabs)/tasks' as any)}
                        pressStyle={{ opacity: 0.9 }}
                        accessibilityLabel={tk.title}
                      >
                        <XStack gap="$3" alignItems="center">
                          <Clock color="$contentSecondary" size={18} />
                          <Body flex={1}>{tk.title}</Body>
                          <Body tone="secondary" fontSize="$2">{formatDate(tk.dueDate!)}</Body>
                        </XStack>
                      </Card>
                    ))}
                  </YStack>
                )}
              </YStack>
            </YStack>
          )}

          {tab === 'milestones' && (
            <YStack gap="$2">
              {goal.milestones.length === 0 ? (
                <EmptyState
                  fullscreen={false}
                  icon={<CheckCircle2 color="$contentTertiary" size={32} />}
                  title={{ i18nKey: 'goals.workspace.milestonesEmpty' }}
                />
              ) : (
                goal.milestones.map((m) => (
                  <Card
                    key={m.id}
                    variant="elevated"
                    clickable
                    onPress={() => toggleMilestone.mutate(m.id)}
                    pressStyle={{ opacity: 0.7 }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: m.completed }}
                    accessibilityLabel={t('goals.workspace.milestoneA11y', { title: m.title })}
                  >
                    <XStack gap="$3" alignItems="center">
                      {m.completed ? <CheckCircle2 color="$success" size={20} /> : <CircleIcon color="$contentTertiary" size={20} />}
                      <Body flex={1} textDecorationLine={m.completed ? 'line-through' : 'none'}>{m.title}</Body>
                    </XStack>
                  </Card>
                ))
              )}
            </YStack>
          )}

          {tab === 'notes' && (
            <YStack gap="$5">
              <YStack gap="$2">
                <SectionHeader title={{ i18nKey: 'goals.workspace.notes' }} />
                <EmptyState
                  fullscreen={false}
                  icon={<StickyNote color="$contentTertiary" size={32} />}
                  title={{ i18nKey: 'goals.workspace.notesEmpty' }}
                />
              </YStack>

              <YStack gap="$2">
                <SectionHeader title={{ i18nKey: 'goals.workspace.attachments' }} />
                <EmptyState
                  fullscreen={false}
                  icon={<Paperclip color="$contentTertiary" size={32} />}
                  title={{ i18nKey: 'goals.workspace.attachmentsEmpty' }}
                />
              </YStack>

              <YStack gap="$2">
                <SectionHeader title={{ i18nKey: 'goals.workspace.activity' }} />
                <EmptyState
                  fullscreen={false}
                  icon={<History color="$contentTertiary" size={32} />}
                  title={{ i18nKey: 'goals.workspace.activityEmpty' }}
                />
              </YStack>
            </YStack>
          )}
        </YStack>
      </AppScreen>

      <RenameGoalDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentTitle={goal.title}
        currentDescription={goal.description ?? ''}
        isSaving={renameGoal.isPending || updateGoalDescription.isPending}
        onSave={async (title, description) => {
          // Sequenced, not Promise.all-ed — both mutate the same Goal
          // aggregate (demo-mode concurrent-write hazard: unlocked
          // read-modify-write can silently lose one of two parallel writes).
          await renameGoal.mutateAsync({ id: goal.id, title });
          await updateGoalDescription.mutateAsync({ id: goal.id, description });
          setRenameOpen(false);
        }}
      />

      <ConfirmationDialog
        open={confirmingActivate}
        onOpenChange={setConfirmingActivate}
        titleI18nKey="goals.workspace.confirmActivate.title"
        titleI18nParams={{ title: goal.title }}
        descriptionI18nKey="goals.workspace.confirmActivate.description"
        descriptionI18nParams={{ title: goal.title }}
        confirmI18nKey="goals.workspace.activate"
        cancelI18nKey="goals.workspace.renameCancel"
        onConfirm={() => {
          setConfirmingActivate(false);
          activateGoal.mutate(goal.id);
        }}
      />

      <ConfirmationDialog
        open={confirmingComplete}
        onOpenChange={setConfirmingComplete}
        titleI18nKey="goals.workspace.confirmComplete.title"
        titleI18nParams={{ title: goal.title }}
        descriptionI18nKey="goals.workspace.confirmComplete.description"
        descriptionI18nParams={{ title: goal.title }}
        confirmI18nKey="goals.workspace.complete"
        cancelI18nKey="goals.workspace.renameCancel"
        onConfirm={() => {
          setConfirmingComplete(false);
          completeGoal.mutate(goal.id);
        }}
      />

      <ConfirmationDialog
        open={confirmingArchive}
        onOpenChange={setConfirmingArchive}
        titleI18nKey="goals.workspace.confirmArchive.title"
        titleI18nParams={{ title: goal.title }}
        descriptionI18nKey="goals.workspace.confirmArchive.description"
        descriptionI18nParams={{ title: goal.title }}
        confirmI18nKey="goals.workspace.archive"
        cancelI18nKey="goals.workspace.renameCancel"
        destructive
        onConfirm={() => {
          setConfirmingArchive(false);
          archiveGoal.mutate(goal.id);
        }}
      />
    </>
  );
}
