import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';
import type { GenreId } from '@/modules/kernel/domain/ids';

import type { GenreListOutcome, GenreResult, GenreUseCaseDeps } from './types';
import { normalizeGenreSearchTerm } from '../../domain/genre';

export type ListGenresInput = {
  scope: RequestScope;
  cursor?: GenreId;
  limit: number;
  searchTerm?: string;
};

export async function listGenres(
  deps: GenreUseCaseDeps,
  input: ListGenresInput
): Promise<GenreResult<GenreListOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { genre: ['read'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'genre_forbidden' });
  }

  deps.logger.info({ event: 'genre.list' });
  const limit = Math.min(Math.max(input.limit, 1), 100);
  const result = await deps.genreRepository.list({
    cursor: input.cursor,
    limit,
    searchTerm: normalizeGenreSearchTerm(input.searchTerm),
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
