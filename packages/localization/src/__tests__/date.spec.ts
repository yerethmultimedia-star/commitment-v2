import i18next from 'i18next';
import { formatDate, formatTime, formatMonth, formatLongDate } from '../date.js';

describe('Date Localization', () => {
  afterEach(() => {
    i18next.language = 'en';
  });

  it('formats dates in Spanish when i18next.language is es', () => {
    i18next.language = 'es';
    const date = new Date('2023-10-15T12:00:00Z');
    expect(formatMonth(date).toLowerCase()).toBe('octubre');
    const formatted = formatDate(date);
    expect(formatted.toLowerCase()).toContain('oct');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2023');
  });

  it('formats dates in English when i18next.language is en', () => {
    i18next.language = 'en';
    const date = new Date('2023-10-15T12:00:00Z');
    expect(formatMonth(date)).toBe('October');
  });

  it('falls back to English for an unsupported language', () => {
    i18next.language = 'fr';
    const date = new Date('2023-10-15T12:00:00Z');
    expect(formatMonth(date)).toBe('October');
  });

  it('formats a long date with the connector word for its own language, not a fixed literal', () => {
    const date = new Date('2026-07-13T12:00:00Z');

    i18next.language = 'en';
    expect(formatLongDate(date)).toBe('Monday, July 13');

    i18next.language = 'es';
    expect(formatLongDate(date)).toBe('lunes, 13 de julio');
  });

  it('formats time correctly', () => {
    const date = new Date('2023-10-15T14:30:00Z');
    // We expect the local timezone time, but we just check it doesn't crash and returns a string
    const formatted = formatTime(date);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
