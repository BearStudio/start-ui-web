import { describe, expect, it } from 'vitest';

import { toScopeKey } from '@/modules/kernel/domain/ids';
import { genreQueries } from '@/modules/genre/presentation/queries';

describe('genre query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(genreQueries.getAllList({ scopeKey: scopeA }).queryKey).not.toEqual(
      genreQueries.getAllList({ scopeKey: scopeB }).queryKey
    );
  });
});
