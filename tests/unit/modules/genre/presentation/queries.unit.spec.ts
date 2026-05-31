import { describe, expect, it } from 'vitest';

import { genreQueries } from '@/modules/genre/presentation/queries';

describe('genre query keys', () => {
  it('partitions protected read keys by scope', () => {
    expect(
      genreQueries.getAllList({ scopeKey: 'scope-a' }).queryKey
    ).not.toEqual(genreQueries.getAllList({ scopeKey: 'scope-b' }).queryKey);
  });
});
