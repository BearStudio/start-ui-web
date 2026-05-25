import type { RequestScope } from '@/modules/auth';
import type { GenreId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { GenreUseCaseDeps, UseCaseResult } from './types';
import {
  type GenreListPage,
  normalizeGenreSearchTerm,
} from '../../domain/genre';

export type ListGenresInput = {
  scope: RequestScope;
  cursor?: GenreId;
  limit: number;
  searchTerm?: string;
};

export async function listGenres(
  deps: GenreUseCaseDeps,
  input: ListGenresInput
): Promise<UseCaseResult<GenreListPage, 'forbidden'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    genre: ['read'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('genre.list', { event: 'genre.list' });
  const limit = Math.min(Math.max(input.limit, 1), 100);
  const value = await deps.genreRepository.list({
    cursor: input.cursor,
    limit,
    searchTerm: normalizeGenreSearchTerm(input.searchTerm),
  });
  return { ok: true, value };
}
