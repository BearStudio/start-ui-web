import { type BookQueryFacade, createBookQueries } from './queries';
import {
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} from '../server';

export const bookQueries = createBookQueries({
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} satisfies BookQueryFacade);
