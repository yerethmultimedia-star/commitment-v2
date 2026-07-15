import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack as ExpoStack } from 'expo-router';
import { YStack, XStack, Circle, ScrollView } from 'tamagui';
import {
  CheckCircle2, Circle as CircleIcon, StickyNote, Paperclip, History, ListChecks, Repeat, Clock, Pencil,
} from '@tamagui/lucide-icons';
import { AppScreen, Card, Title, Body, IconButton } from '@commitment/design-system';
import { formatDate } from '@commitment/localization';
import { useRouter } from 'expo-router';
import { useGoal, useToggleMilestone } from '../hooks/useGoals';
import { useCommitments } from '@/features/commitments/hooks/useCommitments';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useHabits, useToggleHabit } from '@/features/habits/hooks/useHabits';
import { formatRecurrence } from '@/features/habits/utils/format-recurrence';
import { CommitmentStatusBadge } from '@/features/commitments/components/CommitmentStatusBadge';
import { CircularProgress } from '../components/CircularProgress';
import { CATEGORY_ICON } from '../utils/goal-descriptors';

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
  const { data: goal, isLoading } = useGoal(goalId);
  const { data: commitments = [] } = useCommitments();
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const toggleHabit = useToggleHabit();
  const toggleMilestone = useToggleMilestone();
  const [tab, setTab] = useState<WorkspaceTab>('summary');

  const linkedCommitments = useMemo(
    () => commitments.filter((c) => goal?.commitmentIds.includes(c.id)),
    [commitments, goal]
  );
  const linkedHabits = useMemo(
    () => habits.filter((h) => h.goalId === goalId),
    [habits, goalId]
  );
  const linkedTasks = useMemo(
    () => tasks.filter((tk) => tk.commitmentId && goal?.commitmentIds.includes(tk.commitmentId)),
    [tasks, goal]
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
        <YStack padding="$4">
          <Body i18nKey="goals.workspace.loading" tone="secondary" />
        </YStack>
      </AppScreen>
    );
  }

  const CategoryIcon = CATEGORY_ICON[goal.category];

  return (
    <>
      <ExpoStack.Screen options={{ headerShown: true, title: goal.title, presentation: 'card' }} />
      <AppScreen scrollable announceOnFocus="Goal workspace loaded">
        <YStack padding="$4" gap="$4" backgroundColor="$background">
          <XStack gap="$3" alignItems="center">
            <Circle size={40} backgroundColor="$focus" justifyContent="center" alignItems="center">
              <CategoryIcon color="$accent" size={20} />
            </Circle>
            <XStack gap="$2" alignItems="center" flex={1}>
              <Body tone="secondary" fontSize="$2">{t(`goals.categories.${goal.category}`)}</Body>
              <Circle size={4} backgroundColor="$divider" />
              <Body tone="secondary" fontSize="$2" fontWeight="700">{t(`goals.priority.${goal.priority}`)}</Body>
            </XStack>
          </XStack>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$md" borderBottomWidth={1} borderBottomColor="$divider">
              {TABS.map((tb) => (
                <YStack
                  key={tb}
                  onPress={() => setTab(tb)}
                  paddingBottom="$2"
                  borderBottomWidth={2}
                  borderBottomColor={tab === tb ? '$accent' : 'transparent'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tab === tb }}
                >
                  <Body fontWeight={tab === tb ? '700' : '500'} color={tab === tb ? '$accent' : '$contentSecondary'}>
                    {t(`goals.workspace.tabs.${tb}`)}
                  </Body>
                </YStack>
              ))}
            </XStack>
          </ScrollView>

          {tab === 'summary' && (
            <YStack gap="$5">
              <Card variant="elevated">
                <XStack gap="$4" alignItems="center">
                  <CircularProgress progress={goal.progress} />
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

              <YStack gap="$2">
                <Card variant="elevated">
                  <YStack gap="$2">
                    {goal.targetDate && (
                      <XStack justifyContent="space-between">
                        <Body tone="secondary">{t('goals.workspace.dueDate')}</Body>
                        <Body fontWeight="600">{formatDate(goal.targetDate)}</Body>
                      </XStack>
                    )}
                    <XStack justifyContent="space-between">
                      <Body tone="secondary">{t('goals.workspace.type')}</Body>
                      <Body fontWeight="600">{t(`goals.categories.${goal.category}`)}</Body>
                    </XStack>
                  </YStack>
                </Card>
              </YStack>

              <YStack gap="$2">
                <SectionLabel text={t('goals.workspace.statistics')} />
                <XStack gap="$3" flexWrap="wrap">
                  <StatCard icon={ListChecks} label={t('goals.workspace.stats.tasks')} value={`${stats.completedTasks}/${stats.totalTasks}`} />
                  <StatCard icon={Repeat} label={t('goals.workspace.stats.avgStreak')} value={t('goals.workspace.stats.days', { count: stats.avgStreak })} />
                  <StatCard icon={CheckCircle2} label={t('goals.workspace.stats.milestones')} value={`${stats.completedMilestones}/${stats.totalMilestones}`} />
                </XStack>
              </YStack>
            </YStack>
          )}

          {tab === 'tasks' && (
            <YStack gap="$5">
              {linkedCommitments.length > 0 && (
                <YStack gap="$2">
                  <SectionLabel text={t('goals.workspace.commitments')} />
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
                </YStack>
              )}

              {linkedHabits.length > 0 && (
                <YStack gap="$2">
                  <SectionLabel text={t('goals.workspace.habits')} />
                  <YStack gap="$2">
                    {linkedHabits.map((h) => (
                      <Card key={h.id} variant="elevated" opacity={h.enabled ? 1 : 0.55}>
                        <XStack gap="$3" alignItems="center">
                          <XStack
                            flex={1}
                            gap="$3"
                            alignItems="center"
                            onPress={h.enabled ? () => toggleHabit.mutate({ id: h.id, completedToday: h.completedToday }) : undefined}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: h.completedToday, disabled: !h.enabled }}
                            accessibilityLabel={h.title}
                          >
                            <Circle
                              size={22} height={22} borderRadius={11} borderWidth={2}
                              borderColor={h.completedToday ? '$success' : '$divider'}
                              backgroundColor={h.completedToday ? '$success' : 'transparent'}
                              justifyContent="center" alignItems="center"
                            >
                              {h.completedToday && <CheckCircle2 size={14} color="$contentOnSemantic" />}
                            </Circle>
                            <YStack flex={1}>
                              <Body textDecorationLine={h.completedToday ? 'line-through' : 'none'}>{h.title}</Body>
                              <Body tone="secondary" fontSize="$2">{formatRecurrence(t, h.recurrence)}</Body>
                            </YStack>
                            {h.currentStreakDays > 0 && (
                              <Body tone="secondary" fontSize="$2">{t('goals.workspace.stats.days', { count: h.currentStreakDays })}</Body>
                            )}
                          </XStack>
                          <IconButton
                            iconToken={<Pencil size={16} />}
                            tooltipI18nKey="habits.form.editTitle"
                            accessibilityHintI18nKey="habits.form.editTitle"
                            onPress={() => router.push(`/habits/${h.id}/edit` as any)}
                          />
                        </XStack>
                      </Card>
                    ))}
                  </YStack>
                </YStack>
              )}

              <YStack gap="$2">
                <SectionLabel text={t('goals.workspace.upcoming')} />
                {upcomingTasks.length === 0 ? (
                  <Card variant="elevated">
                    <Body tone="secondary" i18nKey="goals.workspace.upcomingEmpty" />
                  </Card>
                ) : (
                  <YStack gap="$2">
                    {upcomingTasks.map((tk) => (
                      <Card key={tk.id} variant="elevated">
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
                <Card variant="elevated">
                  <Body tone="secondary" i18nKey="goals.workspace.upcomingEmpty" />
                </Card>
              ) : (
                goal.milestones.map((m: any) => (
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
                <SectionLabel text={t('goals.workspace.notes')} />
                <Card variant="elevated">
                  <XStack gap="$3" alignItems="center">
                    <StickyNote color="$contentTertiary" size={20} />
                    <Body tone="secondary" flex={1} i18nKey="goals.workspace.notesEmpty" />
                  </XStack>
                </Card>
              </YStack>

              <YStack gap="$2">
                <SectionLabel text={t('goals.workspace.attachments')} />
                <Card variant="elevated">
                  <XStack gap="$3" alignItems="center">
                    <Paperclip color="$contentTertiary" size={20} />
                    <Body tone="secondary" flex={1} i18nKey="goals.workspace.attachmentsEmpty" />
                  </XStack>
                </Card>
              </YStack>

              <YStack gap="$2">
                <SectionLabel text={t('goals.workspace.activity')} />
                <Card variant="elevated">
                  <XStack gap="$3" alignItems="center">
                    <History color="$contentTertiary" size={20} />
                    <Body tone="secondary" flex={1} i18nKey="goals.workspace.activityEmpty" />
                  </XStack>
                </Card>
              </YStack>
            </YStack>
          )}
        </YStack>
      </AppScreen>
    </>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Body fontWeight="600" tone="secondary" textTransform="uppercase" fontSize="$2">
      {text}
    </Body>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string }) {
  return (
    <Card variant="elevated" flex={1} minWidth={100}>
      <YStack gap="$2" alignItems="center">
        <Icon color="$accent" size={20} />
        <Title fontSize="$title" lineHeight="$title">{value}</Title>
        <Body tone="secondary" fontSize="$2" textAlign="center">{label}</Body>
      </YStack>
    </Card>
  );
}
