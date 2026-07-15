import { pickBestWorstDay, FocusDayBar } from '../focus-detail';

function day(date: string, focusMinutes: number): FocusDayBar {
  return { date, weekdayLabel: date, focusMinutes };
}

describe('pickBestWorstDay', () => {
  it('picks the max and min focusMinutes days', () => {
    const days = [day('2026-07-13', 30), day('2026-07-14', 90), day('2026-07-15', 10)];
    const { bestDay, worstDay } = pickBestWorstDay(days);
    expect(bestDay?.date).toBe('2026-07-14');
    expect(worstDay?.date).toBe('2026-07-15');
  });

  it('breaks ties by first occurrence', () => {
    const days = [day('2026-07-13', 30), day('2026-07-14', 30), day('2026-07-15', 30)];
    const { bestDay, worstDay } = pickBestWorstDay(days);
    expect(bestDay?.date).toBe('2026-07-13');
    expect(worstDay?.date).toBe('2026-07-13');
  });

  it('suppresses both when every day is 0 minutes', () => {
    const days = [day('2026-07-13', 0), day('2026-07-14', 0)];
    const { bestDay, worstDay } = pickBestWorstDay(days);
    expect(bestDay).toBeNull();
    expect(worstDay).toBeNull();
  });

  it('suppresses both for an empty list', () => {
    const { bestDay, worstDay } = pickBestWorstDay([]);
    expect(bestDay).toBeNull();
    expect(worstDay).toBeNull();
  });

  it('never picks a day the caller excluded — future days must be filtered before calling', () => {
    // pickBestWorstDay has no isFuture concept of its own; it trusts the
    // caller (useFocusDetail) to exclude future days first. This test just
    // documents that trust boundary — a "day" object passed in is picked
    // purely on focusMinutes, with no other filtering inside this function.
    const days = [day('2026-07-13', 5), day('2026-07-20', 500)];
    const { bestDay } = pickBestWorstDay(days);
    expect(bestDay?.date).toBe('2026-07-20');
  });
});
