import { useTranslation } from 'react-i18next';
import { formatTime, formatDate } from '@commitment/localization';

export function useActivityDateFormatter() {
  const { t, i18n } = useTranslation('commitments'); // Actually, might be better to have an 'activity' namespace or put in 'commitments'

  return {
    formatDate: (date: Date): string => {
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      const timeStr = formatTime(date);

      if (isToday) {
        return t('activity.date.today', { time: timeStr, defaultValue: `Today • ${timeStr}` });
      }

      if (isYesterday) {
        return t('activity.date.yesterday', { time: timeStr, defaultValue: `Yesterday • ${timeStr}` });
      }

      const dateStr = formatDate(date, date.getFullYear() !== now.getFullYear() ? 'PP' : 'MMM d');
      return `${dateStr} • ${timeStr}`;
    },
  };
}
