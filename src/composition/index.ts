export {
  __resetAccountComposition,
  type AccountOverrides,
  getAccountUseCases,
} from './account';
export {
  __resetBookComposition,
  type BookOverrides,
  getBookUseCases,
} from './book';
export {
  __resetGenreComposition,
  type GenreOverrides,
  getGenreUseCases,
} from './genre';
export {
  __resetKernelComposition,
  getKernel,
  type KernelOverrides,
} from './kernel';
export {
  __resetUserComposition,
  getUserUseCases,
  type UserOverrides,
} from './user';

import { type AccountOverrides, getAccountUseCases } from './account';
import { type BookOverrides, getBookUseCases } from './book';
import { type GenreOverrides, getGenreUseCases } from './genre';
import { getKernel, type KernelOverrides } from './kernel';
import { getUserUseCases, type UserOverrides } from './user';

export type ServicesOverrides = {
  kernel?: KernelOverrides;
  book?: Omit<BookOverrides, 'kernel'>;
  user?: Omit<UserOverrides, 'kernel'>;
  genre?: Omit<GenreOverrides, 'kernel'>;
  account?: Omit<AccountOverrides, 'kernel'>;
};

export function getServices(overrides?: ServicesOverrides) {
  if (overrides === undefined) {
    return {
      kernel: getKernel(),
      book: getBookUseCases(),
      user: getUserUseCases(),
      genre: getGenreUseCases(),
      account: getAccountUseCases(),
    } as const;
  }

  const kernel = getKernel(overrides.kernel ?? {});
  return {
    kernel,
    book: getBookUseCases({ ...overrides.book, kernel }),
    user: getUserUseCases({ ...overrides.user, kernel }),
    genre: getGenreUseCases({ ...overrides.genre, kernel }),
    account: getAccountUseCases({ ...overrides.account, kernel }),
  } as const;
}
