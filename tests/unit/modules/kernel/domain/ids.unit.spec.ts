import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { ZodError } from 'zod';

import { IdValidationError } from '@/modules/kernel/domain/errors/id-validation-error';
import {
  type BookId,
  type EmailAddress,
  type ScopeKey,
  toBookId,
  toEmailAddress,
  toGenreId,
  toScopeKey,
  toSessionId,
  toUserId,
  type UserId,
  zBookId,
  zEmailAddress,
  zGenreId,
  zScopeKey,
  zSessionId,
  zUserId,
} from '@/modules/kernel/domain/ids';

const nonBlankString = fc
  .string({ maxLength: 80 })
  .filter((value) => value.trim().length > 0);

const whitespaceOnlyString = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r', '\v', '\f'), {
    minLength: 1,
    maxLength: 32,
  })
  .map((characters) => characters.join(''));

function captureThrown(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    return error;
  }

  throw new Error('Expected function to throw.');
}

describe('kernel domain ids', () => {
  it('parses branded IDs from trimmed strings', () => {
    expect(zUserId().parse(' cm123 ')).toBe('cm123');
    expect(zBookId().parse(' book-1 ')).toBe('book-1');
    expect(zGenreId().parse(' genre-1 ')).toBe('genre-1');
    expect(zSessionId().parse(' session-1 ')).toBe('session-1');
    expect(zScopeKey().parse(' anonymous ')).toBe('anonymous');
    expect(() => zUserId().parse('')).toThrow(ZodError);
  });

  it('parses email addresses', () => {
    expect(zEmailAddress().parse('user@example.com')).toBe('user@example.com');
    expect(() => zEmailAddress().parse('not-an-email')).toThrow();
  });

  it('converts primitive strings into branded domain values', () => {
    expect(toUserId(' user-1 ')).toBe('user-1');
    expect(toBookId(' book-1 ')).toBe('book-1');
    expect(toGenreId(' genre-1 ')).toBe('genre-1');
    expect(toSessionId(' session-1 ')).toBe('session-1');
    expect(toScopeKey(' anonymous ')).toBe('anonymous');
    expect(toEmailAddress(' user@example.com ')).toBe('user@example.com');
    expect(() => toEmailAddress('not-an-email')).toThrow(IdValidationError);
  });

  it('keeps domain brands distinct at compile time', () => {
    expectTypeOf(toUserId('user-1')).toEqualTypeOf<UserId>();
    expectTypeOf(toBookId('book-1')).toEqualTypeOf<BookId>();
    expectTypeOf(toScopeKey('anonymous')).toEqualTypeOf<ScopeKey>();
    expectTypeOf(
      toEmailAddress('user@example.com')
    ).toEqualTypeOf<EmailAddress>();
    expectTypeOf(toUserId('user-1')).not.toEqualTypeOf<BookId>();
    expectTypeOf<string>().not.toExtend<UserId>();
    expectTypeOf<UserId>().toExtend<string>();
  });

  it('throws first-class ID validation errors for blank IDs', () => {
    expect(() => toUserId('  ')).toThrow(IdValidationError);

    const error = captureThrown(() => toUserId('  '));
    expect(error).toMatchObject({
      name: 'IdValidationError',
      code: 'INVALID_ID',
      details: {
        typeName: 'UserId',
        value: '<blank>',
      },
    });
  });

  it('truncates long invalid ID values in error details', () => {
    const invalidValue = 'x'.repeat(80);

    const error = captureThrown(() => toEmailAddress(invalidValue));
    expect(error).toMatchObject({
      details: {
        typeName: 'EmailAddress',
        value: 'xxxxxxxxxxxxxxxxxxxxxxxx...<truncated:80>',
      },
    });
  });

  test.prop([nonBlankString], PROPERTY_DEFAULTS)(
    'trims nonblank primitive IDs for all branded constructors',
    (value) => {
      const expected = value.trim();

      expect(toUserId(value)).toBe(expected);
      expect(toBookId(value)).toBe(expected);
      expect(toGenreId(value)).toBe(expected);
      expect(toSessionId(value)).toBe(expected);
      expect(toScopeKey(value)).toBe(expected);
    }
  );

  test.prop([whitespaceOnlyString], PROPERTY_DEFAULTS)(
    'throws first-class validation errors for whitespace-only IDs',
    (value) => {
      expect(() => toUserId(value)).toThrow(IdValidationError);
      expect(() => toBookId(value)).toThrow(IdValidationError);
      expect(() => toGenreId(value)).toThrow(IdValidationError);
      expect(() => toSessionId(value)).toThrow(IdValidationError);
      expect(() => toScopeKey(value)).toThrow(IdValidationError);
    }
  );

  test.prop([nonBlankString], PROPERTY_DEFAULTS)(
    'keeps Zod ID schemas aligned with branded ID constructors',
    (value) => {
      expect(zUserId().parse(value)).toBe(toUserId(value));
      expect(zBookId().parse(value)).toBe(toBookId(value));
      expect(zGenreId().parse(value)).toBe(toGenreId(value));
      expect(zSessionId().parse(value)).toBe(toSessionId(value));
      expect(zScopeKey().parse(value)).toBe(toScopeKey(value));
    }
  );
});
