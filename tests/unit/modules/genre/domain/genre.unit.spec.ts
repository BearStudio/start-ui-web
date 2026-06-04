import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { describe, expect, it } from 'vitest';

import { normalizeGenreSearchTerm } from '@/modules/genre/domain/genre';
import { isValidGenreColor } from '@/modules/genre/domain/genre-policy';

const hexCharacter = fc.constantFrom(
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F'
);

describe('genre domain', () => {
  it('normalizes search terms and validates hex colors', () => {
    expect(normalizeGenreSearchTerm(' fiction ')).toBe('fiction');
    expect(normalizeGenreSearchTerm(undefined)).toBe('');
    expect(isValidGenreColor('#aabbcc')).toBe(true);
    expect(isValidGenreColor('aabbcc')).toBe(false);
  });

  test.prop([fc.string({ maxLength: 80 })], PROPERTY_DEFAULTS)(
    'normalizes generated search terms by trimming only',
    (searchTerm) => {
      expect(normalizeGenreSearchTerm(searchTerm)).toBe(searchTerm.trim());
    }
  );

  test.prop(
    [fc.array(hexCharacter, { minLength: 6, maxLength: 6 })],
    PROPERTY_DEFAULTS
  )('accepts generated six-digit hex colors with a leading hash', (digits) => {
    expect(isValidGenreColor(`#${digits.join('')}`)).toBe(true);
  });
});
