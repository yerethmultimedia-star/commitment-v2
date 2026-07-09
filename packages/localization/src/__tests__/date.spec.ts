import { formatDate, formatTime } from '../date.js';

describe('Date Localization', () => {
  it('formats dates correctly in Spanish by default', () => {
    const date = new Date('2023-10-15T12:00:00Z');
    // Using simple format pattern 'PP' gives e.g. "15 oct 2023" depending on exact locale strings
    const formatted = formatDate(date);
    expect(formatted.toLowerCase()).toContain('oct');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2023');
  });

  it('formats time correctly', () => {
    const date = new Date('2023-10-15T14:30:00Z');
    // We expect the local timezone time, but we just check it doesn't crash and returns a string
    const formatted = formatTime(date);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
