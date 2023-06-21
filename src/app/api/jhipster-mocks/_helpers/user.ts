import { Prisma, User } from '@prisma/client';
import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/app/api/jhipster-mocks/_helpers/api';

export type UserFormatted<U extends Partial<User> = User> = ReturnType<
  typeof formatUserFromDb<U>
>;

export const formatUserFromDb = <U extends Partial<User>>(user?: U | null) => {
  if (!user) {
    return undefined;
  }

  // Drop some fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, authorities, ...userSafe } = user;

  // Format fields for UI
  return {
    ...userSafe,
    authorities: authorities?.split(','),
  };
};

export const prepareUserForDb = <
  U extends Partial<UserFormatted & { password?: string }>
>(
  user: U
) => {
  // Format fields for database
  return {
    ...user,
    authorities: user?.authorities?.join(',') ?? undefined,
  };
};

export const userErrorResponse = (e: unknown) => {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === 'P2002' &&
    Array.isArray(e.meta?.target)
  ) {
    if (e.meta?.target?.includes('email')) {
      return NextResponse.json(
        { title: 'Email already used', errorKey: 'emailexists' },
        { status: 400 }
      );
    }
    if (e.meta?.target?.includes('login')) {
      return NextResponse.json(
        { title: 'Username already used', errorKey: 'userexists' },
        { status: 400 }
      );
    }
  }
  return unknownErrorResponse();
};
