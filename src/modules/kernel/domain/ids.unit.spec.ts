import { describe, expect, it } from 'vitest';

import { IdValidationError } from './errors/id-validation-error';
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
} from './ids';

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
});
