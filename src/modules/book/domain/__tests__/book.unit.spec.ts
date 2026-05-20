import { describe, expect, it } from 'vitest';

import { toGenreId } from '@/modules/kernel/domain/ids';

import { normalizeBookWriteInput } from '../book';
import { isDuplicateBookCandidate } from '../book-policy';

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
});
