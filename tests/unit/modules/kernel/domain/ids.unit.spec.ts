import { describe, expect, it } from 'vitest';

import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';

import { IdValidationError } from '@/modules/kernel/domain/errors/id-validation-error';
import {
  toBookId,
  toEmailAddress,
  toGenreId,
  toScopeKey,
  toSessionId,
  toUserId,
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

describe('kernel domain ids', () => {
  it('parses branded IDs from trimmed strings', () => {
    expect(zUserId().parse(' cm123 ')).toBe('cm123');
    expect(zBookId().parse(' book-1 ')).toBe('book-1');
    expect(zGenreId().parse(' genre-1 ')).toBe('genre-1');
    expect(zSessionId().parse(' session-1 ')).toBe('session-1');
    expect(zScopeKey().parse(' anonymous ')).toBe('anonymous');
    expect(() => zUserId().parse('')).toThrow(IdValidationError);
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

  it('throws first-class ID validation errors for blank IDs', () => {
    expect(() => toUserId('  ')).toThrow(IdValidationError);

    try {
      toUserId('  ');
    } catch (error) {
      expect(error).toMatchObject({
        name: 'IdValidationError',
        code: 'INVALID_ID',
        details: {
          typeName: 'UserId',
          value: '<blank>',
        },
      });
    }
  });

  it('truncates long invalid ID values in error details', () => {
    expect.assertions(1);
    const invalidValue = 'x'.repeat(80);

    try {
      toEmailAddress(invalidValue);
    } catch (error) {
      expect(error).toMatchObject({
        details: {
          typeName: 'EmailAddress',
          value: 'xxxxxxxxxxxxxxxxxxxxxxxx...<truncated:80>',
        },
      });
    }
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
