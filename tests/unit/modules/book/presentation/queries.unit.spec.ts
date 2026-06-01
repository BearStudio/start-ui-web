import { describe, expect, it } from 'vitest';

import { toBookId, toScopeKey } from '@/modules/kernel/domain/ids';
import { bookQueries } from '@/modules/book/presentation/queries';

describe('book query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(
      bookQueries.getAllInfinite({ scopeKey: scopeA }).queryKey
    ).not.toEqual(bookQueries.getAllInfinite({ scopeKey: scopeB }).queryKey);

    expect(
      bookQueries.getById({ id: toBookId('book-1'), scopeKey: scopeA }).queryKey
    ).toContainEqual({ scopeKey: scopeA });
  });
});
