import { createGenreQueries, type GenreQueryFacade } from './queries';
import { genreGetAll } from '../server';

export const genreQueries = createGenreQueries({
  genreGetAll,
} satisfies GenreQueryFacade);
