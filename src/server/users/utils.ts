import { User } from '@prisma/client';

export type UserFormatted = ReturnType<typeof formatUserFromDb>;

export const formatUserFromDb = <T extends Partial<User>>(user?: T | null) => {
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
  T extends Partial<UserFormatted & { password?: string }>
>(
  user: T
) => {
  // Format fields for database
  return {
    ...user,
    authorities: user?.authorities?.join(',') ?? undefined,
  };
};
