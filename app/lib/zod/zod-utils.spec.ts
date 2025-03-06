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

  describe('nonEmptyNullable', () => {
    test.each([
      { input: 'string', output: 'string', expected: true },
      { input: undefined, expected: false },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.string.nonEmptyNullable(z.string()).safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('nonEmptyNullish', () => {
    test.each([
      { input: 'string', output: 'string', expected: true },
      { input: undefined, output: undefined, expected: true },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.string.nonEmptyNullish(z.string()).safeParse(input);
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

  describe('emailNullable', () => {
    test.each([
      { input: 'name@company.com', output: 'name@company.com', expected: true },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
      { input: 'company.com', expected: false },
      { input: undefined, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.string.emailNullable(z.string()).safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('emailNullish', () => {
    test.each([
      { input: 'name@company.com', output: 'name@company.com', expected: true },
      { input: undefined, output: undefined, expected: true },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
      { input: 'company.com', expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.string.emailNullish(z.string()).safeParse(input);
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
  describe('nonEmptyNullable', () => {
    test.each([
      { input: ['string'], output: ['string'], expected: true },
      { input: [''], output: [''], expected: true },
      { input: [], output: null, expected: true },
      { input: undefined, expected: false },
      { input: [2], expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.array
        .nonEmptyNullable(z.string().array())
        .safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toStrictEqual(output);
      }
    });
  });

  describe('nonEmptyNullish', () => {
    test.each([
      { input: ['string'], output: ['string'], expected: true },
      { input: [''], output: [''], expected: true },
      { input: [], output: null, expected: true },
      { input: undefined, output: undefined, expected: true },
      { input: [2], expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.array
        .nonEmptyNullish(z.string().array())
        .safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toStrictEqual(output);
      }
    });
  });
});

describe('zu.trpcInput', () => {
  describe('enum', () => {
    test.each([
      { input: 'string', output: 'string', expected: true },
      { input: '', output: '', expected: true },
      { input: 'other', output: undefined, expected: true }, // true is expected because 'other' is a string so the output is undefined
      { input: undefined, output: undefined, expected: false },
      { input: 2, output: undefined, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.trpcInput.enum(z.enum(['string', ''])).safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('enumOptional', () => {
    test.each([
      { input: 'string', output: 'string', expected: true },
      { input: '', output: '', expected: true },
      { input: 'other', output: undefined, expected: true }, // true is expected because 'other' is a string so the output is undefined
      { input: undefined, output: undefined, expected: true },
      { input: 2, output: undefined, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = zu.trpcInput
        .enumOptional(z.enum(['string', '']))
        .safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });
});
