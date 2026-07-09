import { Activity } from '@/shared/models/activity';
import { useTranslation } from 'react-i18next';
import { TimelineItem, TimelineIcon, TimelineDate } from '@/shared/ui/timeline';
import { Text } from 'tamagui';
import { Check, Pause, Play, Plus, X, Edit3, HelpCircle } from '@tamagui/lucide-icons';
import { useActivityDateFormatter } from '@/shared/utils/activityDateFormatter';

export interface ActivityRendererProps {
  activity: Activity;
  isLast?: boolean;
}

export function ActivityRenderer({ activity, isLast }: ActivityRendererProps) {
  const { t } = useTranslation('commitments');
  const { formatDate } = useActivityDateFormatter();

  const formattedDate = formatDate(activity.occurredAt);

  let icon = <HelpCircle size="$1" color="$color1" />;
  let backgroundColor = '$color5';
  let content = <Text>{t(`activity.type.${activity.type}`, { defaultValue: activity.type })}</Text>;
  let accessibilityText = '';

  switch (activity.type) {
    case 'created':
      icon = <Plus size="$1" color="$color1" />;
      backgroundColor = '$blue9';
      content = <Text>{t('activity.type.created', { defaultValue: 'Created this commitment' })}</Text>;
      accessibilityText = `Created this commitment on ${formattedDate}`;
      break;
    case 'activated':
    case 'resumed':
      icon = <Play size="$1" color="$color1" />;
      backgroundColor = '$green9';
      content = <Text>{t('activity.type.activated', { defaultValue: 'Activated the commitment' })}</Text>;
      accessibilityText = `Activated the commitment on ${formattedDate}`;
      break;
    case 'paused':
      icon = <Pause size="$1" color="$color1" />;
      backgroundColor = '$orange9';
      content = <Text>{t('activity.type.paused', { defaultValue: 'Paused the commitment' })}</Text>;
      accessibilityText = `Paused the commitment on ${formattedDate}`;
      break;
    case 'completed':
      icon = <Check size="$1" color="$color1" />;
      backgroundColor = '$green10';
      content = <Text>{t('activity.type.completed', { defaultValue: 'Completed the commitment!' })}</Text>;
      accessibilityText = `Completed the commitment on ${formattedDate}`;
      break;
    case 'cancelled':
      icon = <X size="$1" color="$color1" />;
      backgroundColor = '$red9';
      content = <Text>{t('activity.type.cancelled', { defaultValue: 'Cancelled the commitment' })}</Text>;
      accessibilityText = `Cancelled the commitment on ${formattedDate}`;
      break;
    case 'edited':
      icon = <Edit3 size="$1" color="$color1" />;
      backgroundColor = '$color7';
      content = <Text>{t('activity.type.edited', { defaultValue: 'Edited details' })}</Text>;
      accessibilityText = `Edited details on ${formattedDate}`;
      break;
    default:
      accessibilityText = `Activity ${activity.type} on ${formattedDate}`;
      break;
  }

  return (
    <TimelineItem
      accessibilityLabel={accessibilityText}
      icon={<TimelineIcon icon={icon} backgroundColor={backgroundColor} />}
      content={content}
      date={<TimelineDate>{formattedDate}</TimelineDate>}
      isLast={isLast}
    />
  );
}
