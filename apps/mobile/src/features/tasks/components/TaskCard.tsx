import { XStack, YStack, Circle } from 'tamagui';
import { ChevronRight, PlayCircle, Ban, CheckCircle2, XCircle, Bell, Clock } from '@tamagui/lucide-icons';
import { Card, Body, Badge, BadgeTone, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { TaskModel } from '../models/task.model';
import { useEntityReminder } from '@/core/reminders/use-reminder-store';
import { dateFormatter } from '@/shared/lib/dateFormatter';

/** "45 min" / "1 h" / "1 h 30 min" — same abbreviations as the duration i18n presets (identical in en/es), so this needs no translation of its own for arbitrary values. */
function formatDurationCompact(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Same three levels, same meaning, same tone mapping as Commitment's priority
// (see CommitmentPriorityBadge.tsx) — TECH_DEBT.md Item 38 (V-001).
const PRIORITY_TONE: Record<TaskModel['priority'], BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

const STATUS_ICON_COLOR: Record<TaskModel['status'], string> = {
  pending: '$contentTertiary',
  in_progress: '$accent',
  blocked: '$warning',
  completed: '$success',
  cancelled: '$danger',
};

function StatusIcon({ status }: { status: TaskModel['status'] }) {
  const color = STATUS_ICON_COLOR[status] as any;
  const size = 20;
  if (status === 'in_progress') return <PlayCircle size={size} color={color} />;
  if (status === 'blocked') return <Ban size={size} color={color} />;
  if (status === 'completed') return <CheckCircle2 size={size} color={color} />;
  if (status === 'cancelled') return <XCircle size={size} color={color} />;
  return <Circle size={size} borderWidth={2} borderColor={color} />;
}

interface Props {
  task: TaskModel;
  /** Opens the task's detail — the whole card is this tap target, matching HabitCard. */
  onPress?: () => void;
}

/**
 * Task list row — Task UX Redesign round, rebuilt to match HabitCard's
 * shape and restraint: a status indicator, title, a one-line subtitle
 * (due date + reminder, if any), a priority badge, a chevron. No inline
 * lifecycle actions (Start/Complete/Block/Cancel/Edit/Duplicate) — those
 * now live exclusively in TaskDetailScreen, reached by tapping the card.
 * The list exists to navigate, not to administer a task end to end.
 */
export function TaskCard({ task, onPress }: Props) {
  const { t } = useTranslation('tasks');
  const reminder = useEntityReminder('task', task.id);
  const reminderOn = reminder.settings?.enabled ?? false;
  const dueDateLabel = task.dueDate ? dateFormatter.formatDate(new Date(task.dueDate)) : t('detail.noDueDate');

  return (
    <Card
      variant="elevated"
      padding="$4"
      opacity={task.status === 'completed' || task.status === 'cancelled' ? 0.6 : 1}
    >
      <XStack gap="$4" alignItems="center">
        <StatusIcon status={task.status} />

        <XStack
          flex={1}
          minWidth={0}
          gap="$3"
          alignItems="center"
          onPress={onPress}
          cursor={onPress ? 'pointer' : 'default'}
          {...toPlatformAccessibilityProps({
            accessibilityRole: onPress ? 'button' : undefined,
            accessibilityLabel: onPress ? task.title : undefined,
          })}
        >
          <YStack flex={1} minWidth={0} gap="$1">
            <Body
              fontWeight="600"
              numberOfLines={1}
              ellipsizeMode="tail"
              textDecorationLine={task.status === 'completed' ? 'line-through' : 'none'}
            >
              {task.title}
            </Body>
            <XStack gap="$1" alignItems="center">
              <Body tone="secondary" fontSize="$2" numberOfLines={1}>{dueDateLabel}</Body>
              {reminderOn && <Bell size={12} color="$contentTertiary" />}
              {task.estimatedMinutes > 0 && (
                <XStack gap="$1" alignItems="center" marginLeft="$1">
                  <Clock size={12} color="$contentTertiary" />
                  <Body tone="secondary" fontSize="$2">{formatDurationCompact(task.estimatedMinutes)}</Body>
                </XStack>
              )}
            </XStack>
          </YStack>

          <Badge
            tone={PRIORITY_TONE[task.priority]}
            i18nKey={`tasks:form.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`}
          />

          {onPress && <ChevronRight size={18} color="$contentTertiary" />}
        </XStack>
      </XStack>
    </Card>
  );
}
