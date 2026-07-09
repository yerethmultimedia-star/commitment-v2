import { formatNumber, formatPercentage, formatCurrency, formatList } from '../number.js';

describe('Number Localization', () => {
  it('formats raw numbers correctly', () => {
    expect(formatNumber(1000)).toMatch(/1(\.|,)?000/);
  });

  it('formats percentages correctly', () => {
    expect(formatPercentage(0.15)).toContain('15');
    expect(formatPercentage(0.15)).toContain('%');
  });

  it('formats currencies correctly', () => {
    expect(formatCurrency(1500)).toContain('1500');
    expect(formatCurrency(1500)).toContain('€'); // Assuming es-ES default
  });

  it('formats lists correctly', () => {
    const list = ['Manzanas', 'Peras', 'Plátanos'];
    const result = formatList(list);
    expect(result).toBe('Manzanas, Peras y Plátanos');
  });
});
