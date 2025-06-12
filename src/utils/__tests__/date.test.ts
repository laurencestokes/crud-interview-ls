import { formatDate } from '../date';

describe('formatDate', () => {
  it('formats a valid ISO date string correctly', () => {
    expect(formatDate('2024-03-15')).toBe('15/03/2024');
    expect(formatDate('2024-12-31')).toBe('31/12/2024');
  });

  it('returns the original string for invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
    expect(formatDate('2024-13-45')).toBe('2024-13-45'); // Invalid month and day
  });

  it('handles empty string', () => {
    expect(formatDate('')).toBe('');
  });

  it('handles null or undefined by returning the input', () => {
    // @ts-expect-error Testing invalid input
    expect(formatDate(null)).toBe(null);
    // @ts-expect-error Testing invalid input
    expect(formatDate(undefined)).toBe(undefined);
  });
});
