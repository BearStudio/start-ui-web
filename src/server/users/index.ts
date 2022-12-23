import { db } from '@/server/utils/db';

export const getUserList = async () => {
  return await db.user.findMany();
};

export const getUser = (id: number) => {
  return db.user.findUnique({ where: { id } });
};

export const updateUser = () => {
  return {};
};

export const createUser = () => {
  return {};
};

export const removeUser = () => {
  return {};
};
