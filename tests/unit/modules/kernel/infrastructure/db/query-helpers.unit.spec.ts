import { describe, expect, it } from 'vitest';

import {
  ascendingTextCursorFilter,
  escapedIlikeFilter,
  escapedLikePattern,
  takeCursorPage,
} from '@/modules/kernel/infrastructure/db/query-helpers';
import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';

describe('db query helpers', () => {
  it('builds escaped LIKE patterns and optional filters', () => {
    expect(escapedLikePattern(' Alpha_ ')).toBe('%Alpha\\_%');
    expect(escapedIlikeFilter([genreTable.name], '')).toBeUndefined();
    expect(escapedIlikeFilter([], 'Alpha')).toBeUndefined();
    expect(escapedIlikeFilter([genreTable.name], 'Alpha')).toBeDefined();
    expect(
      ascendingTextCursorFilter({
        sortColumn: genreTable.name,
        idColumn: genreTable.id,
        cursor: { id: 'genre-a', sortValue: 'Alpha' },
      })
    ).toBeDefined();
  });

  it('slices limit-plus-one rows into a cursor page', () => {
    const page = takeCursorPage(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      2,
      (row) => row.id
    );

    expect(page).toEqual({
      pageRows: [{ id: 'a' }, { id: 'b' }],
      nextCursor: 'b',
    });
  });
});
