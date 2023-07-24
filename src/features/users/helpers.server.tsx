import { Prisma, User } from '@prisma/client';
import { z } from 'zod';

import { errorResponseUnknown } from '@/api/helpers';
import { zUserRole } from '@/features/users/api.contract';

export type UserFormatted<U extends Partial<User> = User> = ReturnType<
  typeof userFormatFromDb<U>
>;

/**
 * Format fields for UI
 */
export const userFormatFromDb = <U extends Partial<User>>(user?: U | null) => {
  if (!user) {
    return user;
  }

  // Drop some fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, authorities, ...userSafe } = user;

  return {
    ...userSafe,
    authorities: z.array(zUserRole()).catch([]).parse(authorities?.split(',')),
  } as const;
};

/**
 * Format fields for Database
 */
export const userPrepareForDb = <
  U extends Partial<UserFormatted & { password?: string }>
>(
  user: U
) => {
  return {
    ...user,
    authorities: user?.authorities?.join(',') ?? '',
  } as const;
};

export const userErrorResponse = (e: unknown) => {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === 'P2002' &&
    Array.isArray(e.meta?.target)
  ) {
    if (e.meta?.target?.includes('email')) {
      return {
        status: 400,
        body: {
          title: 'Email already used',
          errorKey: 'emailexists',
        },
      } as const;
    }
    if (e.meta?.target?.includes('login')) {
      return {
        status: 400,
        body: {
          title: 'Username already used',
          errorKey: 'userexists',
        },
      } as const;
    }
  }
  return errorResponseUnknown;
};
