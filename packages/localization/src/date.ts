import { format, formatDistanceToNow, formatDuration as fnsFormatDuration, Duration } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formats a date to a string.
 * Uses Spanish locale by default for this project.
 */
export const formatDate = (date: Date | string | number, formatStr: string = 'PP'): string => {
  return format(new Date(date), formatStr, { locale: es });
};

/**
 * Formats a date relative to now (e.g. "hace 2 días").
 */
export const formatRelativeDate = (date: Date | string | number): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
};

/**
 * Formats just the time of a date.
 */
export const formatTime = (date: Date | string | number): string => {
  return format(new Date(date), 'p', { locale: es });
};

/**
 * Formats a date and time together.
 */
export const formatDateTime = (date: Date | string | number): string => {
  return format(new Date(date), 'PP p', { locale: es });
};

/**
 * Formats a duration (e.g. 2 hours 30 minutes).
 */
export const formatDuration = (duration: Duration): string => {
  return fnsFormatDuration(duration, { locale: es });
};

/**
 * Formats just the month of a date (e.g. "octubre").
 */
export const formatMonth = (date: Date | string | number): string => {
  return format(new Date(date), 'MMMM', { locale: es });
};

/**
 * Formats just the weekday of a date (e.g. "lunes").
 */
export const formatWeekday = (date: Date | string | number): string => {
  return format(new Date(date), 'EEEE', { locale: es });
};
