import { describe, expect, test } from 'vitest';

import { z } from './zod-utils-v4';

describe('z.string', () => {
  describe('nonEmpty', () => {
    test.each([
      { input: 'string', output: 'string', expected: true },
      { input: undefined, expected: false },
      { input: '', expected: false },
      { input: null, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = z.string().nonEmpty().safeParse(input);
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
      const parsed = z.string().nonEmptyNullable().safeParse(input);
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
      const parsed = z.string().nonEmptyNullish().safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('email.strict', () => {
    test.each([
      { input: 'name@company.com', output: 'name@company.com', expected: true },
      { input: undefined, expected: false },
      { input: '', expected: false },
      { input: 'company.com', expected: false },
      { input: null, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = z.email().strict().safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('email.strictNullable', () => {
    test.each([
      { input: 'name@company.com', output: 'name@company.com', expected: true },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
      { input: 'company.com', expected: false },
      { input: undefined, expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = z.email().strictNullable().safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });

  describe('email.strictNullish', () => {
    test.each([
      { input: 'name@company.com', output: 'name@company.com', expected: true },
      { input: undefined, output: undefined, expected: true },
      { input: '', output: null, expected: true },
      { input: null, output: null, expected: true },
      { input: 'company.com', expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = z.email().strictNullish().safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toBe(output);
      }
    });
  });
});

describe('zu.array', () => {
  describe('nonEmptyNullable', () => {
    test.each([
      { input: ['string'], output: ['string'], expected: true },
      { input: [''], output: [''], expected: true },
      { input: [], output: null, expected: true },
      { input: undefined, expected: false },
      { input: [2], expected: false },
    ])('with $input should be $expected', ({ input, output, expected }) => {
      const parsed = z.array(z.string()).nonEmptyNullable().safeParse(input);
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
      const parsed = z.array(z.string()).nonEmptyNullish().safeParse(input);
      expect(parsed.success).toBe(expected);
      if (parsed.success) {
        expect(parsed.data).toStrictEqual(output);
      }
    });
  });
});
