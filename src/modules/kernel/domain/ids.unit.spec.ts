import { describe, expect, it } from 'vitest';

import {
  toBookId,
  toEmailAddress,
  toGenreId,
  toSessionId,
  toUserId,
  zBookId,
  zEmailAddress,
  zGenreId,
  zSessionId,
  zUserId,
} from './ids';

describe('kernel domain ids', () => {
  it('parses branded IDs from trimmed strings', () => {
    expect(zUserId().parse(' cm123 ')).toBe('cm123');
    expect(zBookId().parse(' book-1 ')).toBe('book-1');
    expect(zGenreId().parse(' genre-1 ')).toBe('genre-1');
    expect(zSessionId().parse(' session-1 ')).toBe('session-1');
    expect(() => zUserId().parse('')).toThrow();
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
    expect(toEmailAddress('user@example.com')).toBe('user@example.com');
    expect(() => toEmailAddress('not-an-email')).toThrow();
  });
});
