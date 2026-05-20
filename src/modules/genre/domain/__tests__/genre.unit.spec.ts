import { describe, expect, it } from 'vitest';

import { normalizeGenreSearchTerm } from '../genre';
import { isValidGenreColor } from '../genre-policy';

describe('genre domain', () => {
  it('normalizes search terms and validates hex colors', () => {
    expect(normalizeGenreSearchTerm(' fiction ')).toBe('fiction');
    expect(normalizeGenreSearchTerm(undefined)).toBe('');
    expect(isValidGenreColor('#aabbcc')).toBe(true);
    expect(isValidGenreColor('aabbcc')).toBe(false);
  });
});
