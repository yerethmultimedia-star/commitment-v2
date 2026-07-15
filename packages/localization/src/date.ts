import i18next from 'i18next';
import { format, formatDistanceToNow, formatDuration as fnsFormatDuration, Duration } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const SUPPORTED_LOCALES = { es, en: enUS } as const;

/**
 * Resolves the date-fns locale from i18next's current language rather than
 * a fixed value, so date formatting follows the same active language as
 * every other translated string in the app instead of always rendering in
 * Spanish regardless of the user's selection.
 */
const currentLocale = () => {
  const lang = (i18next.language || 'en').split('-')[0];
  return SUPPORTED_LOCALES[lang as keyof typeof SUPPORTED_LOCALES] ?? enUS;
};

/**
 * Formats a date to a string, in the app's current language.
 */
export const formatDate = (date: Date | string | number, formatStr: string = 'PP'): string => {
  return format(new Date(date), formatStr, { locale: currentLocale() });
};

/**
 * Formats a date relative to now (e.g. "2 days ago" / "hace 2 días").
 */
export const formatRelativeDate = (date: Date | string | number): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: currentLocale() });
};

/**
 * Formats just the time of a date.
 */
export const formatTime = (date: Date | string | number): string => {
  return format(new Date(date), 'p', { locale: currentLocale() });
};

/**
 * Formats a date and time together.
 */
export const formatDateTime = (date: Date | string | number): string => {
  return format(new Date(date), 'PP p', { locale: currentLocale() });
};

/**
 * Formats a duration (e.g. 2 hours 30 minutes).
 */
export const formatDuration = (duration: Duration): string => {
  return fnsFormatDuration(duration, { locale: currentLocale() });
};

/**
 * Formats just the month of a date (e.g. "October" / "octubre").
 */
export const formatMonth = (date: Date | string | number): string => {
  return format(new Date(date), 'MMMM', { locale: currentLocale() });
};

/**
 * Formats just the weekday of a date (e.g. "Monday" / "lunes").
 */
export const formatWeekday = (date: Date | string | number): string => {
  return format(new Date(date), 'EEEE', { locale: currentLocale() });
};

/**
 * Formats the weekday as a single locale-correct letter (e.g. "M" / "L"
 * for Monday/lunes) — for compact UI like a week strip. Uses date-fns'
 * own narrow-weekday token rather than slicing formatWeekday's output, so
 * it stays correct for locales where the first character isn't the right
 * abbreviation.
 */
export const formatWeekdayNarrow = (date: Date | string | number): string => {
  return format(new Date(date), 'EEEEE', { locale: currentLocale() });
};

const REFERENCE_SUNDAY = new Date(2023, 0, 1); // a known Sunday, per Date#getDay()

/**
 * Formats a day-of-week index (0=Sunday..6=Saturday, matching Date#getDay())
 * as a short locale-correct weekday abbreviation (e.g. "Mon" / "lun") — for
 * rendering a recurrence like "Mon, Wed, Fri" without hardcoding day names
 * per locale. Anchors to a known Sunday since date-fns needs a real Date to
 * format from; the index is the only thing that varies.
 */
export const formatWeekdayIndexShort = (dayIndex: number): string => {
  const date = new Date(REFERENCE_SUNDAY);
  date.setDate(REFERENCE_SUNDAY.getDate() + dayIndex);
  return format(date, 'EEE', { locale: currentLocale() });
};

/**
 * Same index-based anchoring as formatWeekdayIndexShort, but the full
 * weekday name (e.g. "Tuesday" / "martes") — for accessibilityLabel on
 * compact day-abbreviation UI (e.g. WeekdayPicker's "M"/"T"/"W" chips),
 * where the visible label is too short for a screen reader to announce
 * meaningfully on its own.
 */
export const formatWeekdayIndexFull = (dayIndex: number): string => {
  const date = new Date(REFERENCE_SUNDAY);
  date.setDate(REFERENCE_SUNDAY.getDate() + dayIndex);
  return format(date, 'EEEE', { locale: currentLocale() });
};

const DEFAULT_LONG_DATE_PATTERN = 'EEEE, MMMM d';
const LONG_DATE_PATTERN: Record<string, string> = {
  es: "EEEE, d 'de' MMMM",
  en: DEFAULT_LONG_DATE_PATTERN,
};

/**
 * Formats a "weekday, month day" long date (e.g. "Monday, July 13" /
 * "lunes, 13 de julio"). The connector word ("de") is part of the
 * grammar, not punctuation, so — unlike the other helpers here — the
 * format PATTERN itself has to vary by language, not just the locale
 * passed to date-fns. Add a language to LONG_DATE_PATTERN before adding
 * that language's translations.
 */
export const formatLongDate = (date: Date | string | number): string => {
  const lang = (i18next.language || 'en').split('-')[0] ?? 'en';
  const pattern = LONG_DATE_PATTERN[lang] ?? DEFAULT_LONG_DATE_PATTERN;
  return format(new Date(date), pattern, { locale: currentLocale() });
};
