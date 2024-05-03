import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { zu } from './zod-utils';

describe('zu.string', () => {
  describe('nonEmpty', () => {
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

  describe('nonEmptyOptional', () => {
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

  describe('email', () => {
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

  describe('emailOptional', () => {
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
});

describe('zu.array', () => {
  describe('nonEmpty', () => {
    test.each([
      { input: ['string'], output: ['string'], expected: true },
      { input: [''], output: [''], expected: true },
      { input: [], expected: false },
      { input: undefined, expected: false },
      { input: [2], expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.array.nonEmpty(z.string().array()).safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toStrictEqual(output);
      }
    });
  });

  describe('nonEmptyOptional', () => {
    test.each([
      { input: ['string'], output: ['string'], expected: true },
      { input: [''], output: [''], expected: true },
      { input: [], output: undefined, expected: true },
      { input: undefined, output: undefined, expected: true },
      { input: [2], expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.array
        .nonEmptyOptional(z.string().array())
        .safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toStrictEqual(output);
      }
    });
  });
});
