import { User } from '@prisma/client';

import { db } from '@/app/api/jhipster-mocks/db';

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

export const getUserList = async (
  options: { skip?: number; take?: number } = {}
) => {
  const [users, total] = await Promise.all([
    db.user.findMany({
      skip: options.skip ?? 0,
      take: options.take ?? 2,
    }),
    db.user.count(),
  ]);

  return {
    users: users.map(formatUserFromDb),
    total,
  } as const;
};

export const getUserById = async (id: number) => {
  const user = await db.user.findUnique({ where: { id } });
  return formatUserFromDb(user);
};

export const getUserByLogin = async (login: string) => {
  const user = await db.user.findUnique({ where: { login } });
  return formatUserFromDb(user);
};

export const updateUserById = async (
  id: number,
  partialUser: Partial<UserFormatted>
) => {
  if (!partialUser) return undefined;
  const user = await db.user.update({
    where: { id },
    data: prepareUserForDb(partialUser),
  });
  return formatUserFromDb(user);
};

export const updateUserByLogin = async (
  login: string,
  partialUser: Partial<UserFormatted>
) => {
  if (!partialUser) return undefined;
  const user = await db.user.update({
    where: { login },
    data: prepareUserForDb(partialUser),
  });
  return formatUserFromDb(user);
};

export const createUser = async (
  newUser: UserFormatted<
    Pick<
      User,
      | 'email'
      | 'login'
      | 'firstName'
      | 'lastName'
      | 'langKey'
      | 'authorities'
      | 'activated'
    >
  >
) => {
  if (!newUser) throw new Error('Missing new user');

  const user = await db.user.create({
    data: prepareUserForDb(newUser),
  });
  return formatUserFromDb(user);
};

export const removeUserByLogin = async (
  login: string,
  currentUserId: number
) => {
  return db.user.delete({ where: { login, NOT: { id: currentUserId } } });
};
