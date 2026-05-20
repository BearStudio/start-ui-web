import { listGenres } from './application/use-cases/list-genres';
import type { GenreUseCaseDeps } from './application/use-cases/types';

export function createGenreUseCases(deps: GenreUseCaseDeps) {
  return {
    list: (input: Parameters<typeof listGenres>[1]) => listGenres(deps, input),
  };
}

export type GenreUseCases = ReturnType<typeof createGenreUseCases>;
