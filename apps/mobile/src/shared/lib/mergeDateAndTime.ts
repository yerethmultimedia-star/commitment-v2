/**
 * Combines a separately-picked date and time into one Date, for the
 * app-wide "date and time are always independent fields, never one
 * combined picker" UX rule — a native date-only or time-only picker only
 * ever returns the part it collected, so callers merge it onto whatever
 * was already there rather than overwriting the other part.
 */
export function mergeDateAndTime(base: Date | null, patch: Date, part: 'date' | 'time'): Date {
  const result = base ? new Date(base) : new Date();
  if (part === 'date') {
    result.setFullYear(patch.getFullYear(), patch.getMonth(), patch.getDate());
  } else {
    result.setHours(patch.getHours(), patch.getMinutes(), 0, 0);
  }
  return result;
}
