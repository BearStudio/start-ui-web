import { User } from '@prisma/client';

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
