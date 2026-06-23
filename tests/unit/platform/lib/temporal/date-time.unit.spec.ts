import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDate,
  formatRelativeDate,
  parseStringToDate,
} from '@/platform/lib/temporal/date-time';

describe('parseStringToDate', () => {
  const SYSTEM_TIME = new Date(2026, 4, 15, 12);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(SYSTEM_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { input: '1', expected: '01/05/2026' },
    { input: '01', expected: '01/05/2026' },
    { input: '10', expected: '10/05/2026' },
    { input: '1005', expected: '10/05/2026' },
    { input: '10/05', expected: '10/05/2026' },
    { input: '10-05', expected: '10/05/2026' },
    { input: '10 05', expected: '10/05/2026' },
    { input: '10.05', expected: '10/05/2026' },
    { input: '100569', expected: '10/05/1969' },
    { input: '10051969', expected: '10/05/1969' },
    { input: '10 05 1969', expected: '10/05/1969' },
    { input: '10/05/1969', expected: '10/05/1969' },
  ])('should parse multiple format by default', ({ input, expected }) => {
    const parsed = parseStringToDate(input);

    expect(formatDate(parsed)).toBe(expected);
  });

  it.each([
    '1 5',
    '01 5',
    '1 05',
    '01 05',
    '1.5',
    '01.5',
    '1.05',
    '01.05',
    '1/5',
    '01/5',
    '1/05',
    '01/05',
    '1-5',
    '01-5',
    '1-05',
    '01-05',
    '1_5',
    '01_5',
    '1_05',
    '01_05',
  ])('should parse compact day and month input: %s', (input) => {
    const parsed = parseStringToDate(input);

    expect(formatDate(parsed)).toBe('01/05/2026');
  });

  it.each([
    '1 5 69',
    '01 5 69',
    '1 05 1969',
    '01 05 1969',
    '1.5.69',
    '01.5.69',
    '1.05.1969',
    '01.05.1969',
    '1/5/69',
    '01/5/69',
    '1/05/1969',
    '01/05/1969',
    '1-5-69',
    '01-5-69',
    '1-05-1969',
    '01-05-1969',
    '1_5_69',
    '01_5_69',
    '1_05_1969',
    '01_05_1969',
  ])('should parse compact day, month, and year input: %s', (input) => {
    const parsed = parseStringToDate(input);

    expect(formatDate(parsed)).toBe('01/05/1969');
  });

  it('should parse custom format', () => {
    const parsed = parseStringToDate('05/10', ['MM/DD']);

    expect(formatDate(parsed)).toBe('10/05/2026');
  });

  it('can parse only supplied formats without default fallback', () => {
    const parsed = parseStringToDate('0510', ['MM/DD', 'MMDD'], {
      includeDefaultFormats: false,
    });

    expect(formatDate(parsed)).toBe('10/05/2026');
  });

  it('returns invalid date when supplied formats do not match and defaults are disabled', () => {
    const parsed = parseStringToDate('1005', ['MM/DD'], {
      includeDefaultFormats: false,
    });

    expect(parsed.getTime()).toBeNaN();
  });
});

describe('formatRelativeDate', () => {
  const SYSTEM_TIME = new Date(2026, 4, 15, 12);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(SYSTEM_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('falls back to now when baseDate is invalid', () => {
    const formatted = formatRelativeDate(new Date(2026, 4, 16, 12), {
      baseDate: new Date(Number.NaN),
      locale: 'en',
    });

    expect(formatted).toBe('tomorrow');
  });
});
