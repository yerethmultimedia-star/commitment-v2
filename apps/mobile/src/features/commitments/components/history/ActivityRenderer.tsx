import { Activity } from '@/shared/models/activity';
import { useTranslation } from 'react-i18next';
import { TimelineItem, TimelineIcon, TimelineDate } from '@/shared/ui/timeline';
import { Text } from 'tamagui';
import {
  Play,
  Pause,
  CheckCircle,
  Trash2,
  Edit3,
  Activity as ActivityIcon,
  Plus
} from '@tamagui/lucide-icons';
import { useActivityDateFormatter } from '@/shared/utils/activityDateFormatter';

export interface ActivityRendererProps {
  activity: Activity;
  isLast?: boolean;
}

export function ActivityRenderer({ activity, isLast }: ActivityRendererProps) {
  const { t } = useTranslation('commitments');
  const { formatDate } = useActivityDateFormatter();

  const formattedDate = formatDate(activity.occurredAt);

  let icon = <ActivityIcon size="$1" color="$contentSecondary" />;
  let backgroundColor = '$surfaceRaised';
  let iconColor = '$contentSecondary';
  let label = t(`activity.type.${activity.type}`, { defaultValue: activity.type });

  switch (activity.type) {
    case 'created':
      backgroundColor = '$accent';
      iconColor = '$contentOnAccent';
      icon = <Plus size="$1" color={iconColor as any} />;
      label = t('activity.type.created', { defaultValue: 'Created this commitment' });
      break;
    case 'activated':
    case 'resumed':
      backgroundColor = '$success';
      iconColor = '$contentOnSemantic';
      icon = <Play size="$1" color={iconColor as any} />;
      label = t('activity.type.activated', { defaultValue: 'Activated the commitment' });
      break;
    case 'paused':
      backgroundColor = '$warning';
      iconColor = '$contentOnSemantic';
      icon = <Pause size="$1" color={iconColor as any} />;
      label = t('activity.type.paused', { defaultValue: 'Paused the commitment' });
      break;
    case 'completed':
      backgroundColor = '$success';
      iconColor = '$contentOnSemantic';
      icon = <CheckCircle size="$1" color={iconColor as any} />;
      label = t('activity.type.completed', { defaultValue: 'Completed the commitment!' });
      break;
    case 'cancelled':
      backgroundColor = '$danger';
      iconColor = '$contentOnSemantic';
      icon = <Trash2 size="$1" color={iconColor as any} />;
      label = t('activity.type.cancelled', { defaultValue: 'Cancelled the commitment' });
      break;
    case 'edited':
      backgroundColor = '$surfaceRaised';
      iconColor = '$contentSecondary';
      icon = <Edit3 size="$1" color={iconColor as any} />;
      label = t('activity.type.edited', { defaultValue: 'Edited details' });
      break;
    default:
      break;
  }

  return (
    <TimelineItem
      accessibilityLabel={t('activity.a11yLabel', { defaultValue: '{{label}} on {{date}}', label, date: formattedDate })}
      icon={<TimelineIcon icon={icon} backgroundColor={backgroundColor} />}
      content={<Text color="$contentPrimary">{label}</Text>}
      date={<TimelineDate>{formattedDate}</TimelineDate>}
      isLast={isLast}
    />
  );
}
