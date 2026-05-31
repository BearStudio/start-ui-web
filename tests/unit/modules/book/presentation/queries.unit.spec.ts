import { describe, expect, it } from 'vitest';

import { bookQueries } from '@/modules/book/presentation/queries';

describe('book query keys', () => {
  it('partitions protected read keys by scope', () => {
    expect(
      bookQueries.getAllInfinite({ scopeKey: 'scope-a' }).queryKey
    ).not.toEqual(bookQueries.getAllInfinite({ scopeKey: 'scope-b' }).queryKey);

    expect(
      bookQueries.getById({ id: 'book-1', scopeKey: 'scope-a' }).queryKey
    ).toContainEqual({ scopeKey: 'scope-a' });
  });
});
