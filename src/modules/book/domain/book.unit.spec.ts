import { describe, expect, it } from 'vitest';

import { toGenreId } from '@/modules/kernel/domain/ids';
import { fc, PROPERTY_DEFAULTS, test } from '@/tests/support/property-testing';

import { normalizeBookWriteInput } from './book';
import { isDuplicateBookCandidate } from './book-policy';

const text = fc.string({ maxLength: 80 });
const nonBlankText = text.filter((value) => value.trim().length > 0);
const optionalText = fc.option(text, { nil: undefined });
const genreId = nonBlankText.map((value) => toGenreId(value));
const duplicateText = fc.stringMatching(/^[a-z]{1,40}$/);

describe('book domain', () => {
  it('normalizes writable book fields', () => {
    expect(
      normalizeBookWriteInput({
        title: ' Title ',
        author: ' Author ',
        genreId: toGenreId('genre-1'),
        publisher: ' ',
        coverId: ' cover ',
      })
    ).toEqual({
      title: 'Title',
      author: 'Author',
      genreId: 'genre-1',
      publisher: null,
      coverId: 'cover',
    });
  });

  it('detects duplicate title and author candidates case-insensitively', () => {
    expect(
      isDuplicateBookCandidate(
        { title: 'Dune', author: 'Frank Herbert' },
        { title: ' dune ', author: 'frank herbert' }
      )
    ).toBe(true);
  });

  test.prop(
    [
      fc.record({
        title: text,
        author: text,
        genreId,
        publisher: optionalText,
        coverId: fc.option(text, { nil: null }),
      }),
    ],
    PROPERTY_DEFAULTS
  )('normalizes writable book fields for generated inputs', (input) => {
    expect(normalizeBookWriteInput(input)).toEqual({
      title: input.title.trim(),
      author: input.author.trim(),
      genreId: input.genreId,
      publisher: input.publisher?.trim() || null,
      coverId: input.coverId?.trim() || null,
    });
  });

  test.prop([duplicateText, duplicateText], PROPERTY_DEFAULTS)(
    'detects duplicate candidates by normalized title and author',
    (title, author) => {
      expect(
        isDuplicateBookCandidate(
          { title, author },
          {
            title: ` ${title.toUpperCase()} `,
            author: ` ${author.toLowerCase()} `,
          }
        )
      ).toBe(true);
    }
  );
});
