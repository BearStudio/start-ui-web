import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { parseStringToDate } from '@/lib/dayjs/parse-string-to-date';

describe('parseStringToDate', () => {
  const FORMAT = 'DD/MM/YYYY';
  it.each([
    { input: '10', expected: dayjs().set('date', 10).format(FORMAT) },
    {
      input: '1005',
      expected: dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10/05',
      expected: dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10-05',
      expected: dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10 05',
      expected: dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '10.05',
      expected: dayjs().set('date', 10).set('month', 4).format(FORMAT),
    },
    {
      input: '100569',
      expected: dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10051969',
      expected: dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10 05 1969',
      expected: dayjs('1969/05/10').format(FORMAT),
    },
    {
      input: '10/05/1969',
      expected: dayjs('1969/05/10').format(FORMAT),
    },
  ])('should parse multiple format by default', ({ input, expected }) => {
    const parsed = parseStringToDate(input);

    expect(dayjs(parsed).format(FORMAT)).toBe(expected);
  });

  it('should parse custom format', () => {
    const parsed = parseStringToDate('05/10', ['MM/DD']);

    expect(dayjs(parsed).format(FORMAT)).toBe(
      dayjs().set('month', 4).set('date', 10).format(FORMAT)
    );
  });
});
