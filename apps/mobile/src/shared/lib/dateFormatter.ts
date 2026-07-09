import i18next from 'i18next';

/**
 * Returns the currently active locale code to be used with Intl APIs.
 */
const getLocale = () => i18next.language || 'en';

export const dateFormatter = {
  formatDate: (dateInput: Date | string | number): string => {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  },

  formatTime: (dateInput: Date | string | number): string => {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat(getLocale(), {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  },

  formatRelative: (dateInput: Date | string | number): string => {
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
    const now = new Date();
    const then = new Date(dateInput);
    const diffInTime = then.getTime() - now.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
    
    // For highly specific relative formatting we can scale this
    if (diffInDays === 0) return rtf.format(0, 'day');
    return rtf.format(diffInDays, 'day');
  },

  formatMonth: (dateInput: Date | string | number): string => {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat(getLocale(), {
      month: 'long',
    }).format(date);
  },

  formatWeekday: (dateInput: Date | string | number): string => {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat(getLocale(), {
      weekday: 'long',
    }).format(date);
  },
};
