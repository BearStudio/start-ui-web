import { db } from '@/server/utils/db';

import { UserFormatted, formatUserFromDb, prepareUserForDb } from './utils';

export const getUserList = async () => {
  const [users, total] = await Promise.all([
    db.user.findMany(), // TODO pagination
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

export const createUser = async (newUser: UserFormatted) => {
  if (!newUser) throw new Error('Missing new user');

  // TODO
  // const user = await db.user.create({
  //   data: prepareUserForDb(newUser),
  // });
  // return formatUserFromDb(user);
};

export const removeUser = () => {
  return {};
};
