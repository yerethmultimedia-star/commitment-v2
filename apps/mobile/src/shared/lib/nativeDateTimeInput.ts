/**
 * Value <-> string conversion for native HTML <input type="date"|"time">,
 * used only on web (the platform @react-native-community/datetimepicker
 * doesn't support at all — see PlainDateTimePicker.tsx/ControlledDatePicker.tsx).
 *
 * `new Date('YYYY-MM-DD')` parses as UTC midnight, which lands on the
 * PREVIOUS local calendar day in any negative-offset timezone once
 * downstream code rounds it to local midnight — a hazard this repo has hit
 * with test fixtures before. Every parse here builds the Date from
 * individual local year/month/day components instead of ever handing a
 * bare ISO string to `new Date(...)`.
 */

const pad2 = (n: number) => String(n).padStart(2, '0');

export function toNativeDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function toNativeTimeInputValue(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** `raw` is the native input's own YYYY-MM-DD value; returns null for an empty/cleared input. */
export function fromNativeDateInputValue(raw: string): Date | null {
  if (!raw) return null;
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** `raw` is the native input's own HH:mm value; attaches to today's date (callers merge onto their own base date via mergeDateAndTime). */
export function fromNativeTimeInputValue(raw: string): Date | null {
  if (!raw) return null;
  const [hours, minutes] = raw.split(':').map(Number);
  if (hours === undefined || minutes === undefined) return null;
  const result = new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
}
