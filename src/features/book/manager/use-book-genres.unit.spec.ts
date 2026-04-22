import { describe, expect, it } from 'vitest';

import { mergeGenres } from '@/features/book/manager/use-book-genres';
import { Genre } from '@/features/genre/schema';

const now = new Date();

const createGenre = (id: number): Genre => ({
  id: `genre-${id}`,
  name: `Genre ${id.toString().padStart(2, '0')}`,
  color: '#112233',
  createdAt: now,
  updatedAt: now,
});

describe('mergeGenres', () => {
  it('merges genres from every loaded page', () => {
    const pages = [
      {
        items: Array.from({ length: 20 }, (_, index) => createGenre(index + 1)),
      },
      {
        items: Array.from({ length: 5 }, (_, index) => createGenre(index + 21)),
      },
    ];

    const result = mergeGenres(pages);

    expect(result).toHaveLength(25);
    expect(result.map((genre) => genre.id)).toContain('genre-25');
  });

  it('preserves an already linked genre that has not loaded yet', () => {
    const linkedGenre = {
      ...createGenre(25),
      name: 'Zebra Tales',
    };

    const result = mergeGenres(
      [
        {
          items: Array.from({ length: 20 }, (_, index) =>
            createGenre(index + 1)
          ),
        },
      ],
      linkedGenre
    );

    expect(result).toHaveLength(21);
    expect(result.at(-1)).toEqual(linkedGenre);
  });

  it('deduplicates an already loaded linked genre and keeps the linked record', () => {
    const linkedGenre = {
      ...createGenre(5),
      name: 'Linked Genre',
      color: '#445566',
    };

    const pages = [
      {
        items: Array.from({ length: 10 }, (_, index) => createGenre(index + 1)),
      },
    ];

    const result = mergeGenres(pages, linkedGenre);
    const matchingGenres = result.filter(
      (genre) => genre.id === linkedGenre.id
    );

    expect(result).toHaveLength(10);
    expect(matchingGenres).toEqual([linkedGenre]);
  });
});
