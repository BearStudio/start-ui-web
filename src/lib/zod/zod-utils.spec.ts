import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { zu } from './zod-utils';

describe('zu.string.nonEmpty', () => {
  test.each([
    { input: 'string', output: 'string', expected: true },
    { input: undefined, expected: false },
    { input: '', expected: false },
    { input: null, expected: false },
  ])('with $input should be $expected', ({ input, output, expected }) => {
    const parsed = zu.string.nonEmpty(z.string()).safeParse(input);
    expect(parsed.success).toBe(expected);
    if (parsed.success) {
      expect(parsed.data).toBe(output);
    }
  });
});

describe('zu.string.nonEmptyOptional', () => {
  test.each([
    { input: 'string', output: 'string', expected: true },
    { input: undefined, output: undefined, expected: true },
    { input: '', output: undefined, expected: true },
    { input: null, expected: false },
  ])('with $input should be $expected', ({ input, output, expected }) => {
    const parsed = zu.string.nonEmptyOptional(z.string()).safeParse(input);
    expect(parsed.success).toBe(expected);
    if (parsed.success) {
      expect(parsed.data).toBe(output);
    }
  });
});

describe('zu.string.email', () => {
  test.each([
    { input: 'name@company.com', output: 'name@company.com', expected: true },
    { input: undefined, expected: false },
    { input: '', expected: false },
    { input: 'company.com', expected: false },
    { input: null, expected: false },
  ])('with $input should be $expected', ({ input, output, expected }) => {
    const parsed = zu.string.email(z.string()).safeParse(input);
    expect(parsed.success).toBe(expected);
    if (parsed.success) {
      expect(parsed.data).toBe(output);
    }
  });
});

describe('zu.string.emailOptional', () => {
  test.each([
    { input: 'name@company.com', output: 'name@company.com', expected: true },
    { input: undefined, output: undefined, expected: true },
    { input: '', output: undefined, expected: true },
    { input: 'company.com', expected: false },
    { input: null, expected: false },
  ])('with $input should be $expected', ({ input, output, expected }) => {
    const parsed = zu.string.emailOptional(z.string()).safeParse(input);
    expect(parsed.success).toBe(expected);
    if (parsed.success) {
      expect(parsed.data).toBe(output);
    }
  });
});
