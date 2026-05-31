import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseStringToDate } from '@/platform/lib/dayjs/parse-string-to-date';

describe('parseStringToDate', () => {
  const FORMAT = 'DD/MM/YYYY';
  const SYSTEM_TIME = new Date(2026, 4, 15, 12);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(SYSTEM_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { input: '1', expected: () => dayjs().set('date', 1).format(FORMAT) },
    { input: '01', expected: () => dayjs().set('date', 1).format(FORMAT) },
    { input: '10', expected: () => dayjs().set('date', 10).format(FORMAT) },
    {
      input: '1005',
      expected: () => dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10/05',
      expected: () => dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10-05',
      expected: () => dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10 05',
      expected: () => dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10.05',
      expected: () => dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '100569',
      expected: () => dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10051969',
      expected: () => dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10 05 1969',
      expected: () => dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10/05/1969',
      expected: () => dayjs('1969/05/10').format(FORMAT),
    },
  ])('should parse multiple format by default', ({ input, expected }) => {
    const parsed = parseStringToDate(input);

    expect(dayjs(parsed).format(FORMAT)).toBe(expected());
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

    expect(dayjs(parsed).format(FORMAT)).toBe(
      dayjs().set('date', 1).set('month', 4).format(FORMAT)
    );
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

    expect(dayjs(parsed).format(FORMAT)).toBe(
      dayjs('1969/05/01').format(FORMAT)
    );
  });

  it('should parse custom format', () => {
    const parsed = parseStringToDate('05/10', ['MM/DD']);

    expect(dayjs(parsed).format(FORMAT)).toBe(
      dayjs().set('month', 4).set('date', 10).format(FORMAT)
    );
  });
});
