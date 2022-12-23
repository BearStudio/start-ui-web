import bcrypt from 'bcrypt';

import { db } from '../utils/db';

export const getAccount = () => {
  return {};
};

type createAccountParams = {
  email: string;
  login: string;
  password: string;
  langKey: string;
};

export const createAccount = async ({
  email,
  login,
  password,
  langKey,
}: createAccountParams) => {
  const passwordHash = await bcrypt.hash(password, 12);
  return await db.user.create({
    data: {
      email,
      login,
      password: passwordHash,
      langKey,
    },
  });
};

export const activateAccount = () => {
  return {};
};

export const updateAccount = () => {
  return {};
};

export const resetPasswordInit = () => {
  return {};
};

export const resetPasswordFinish = () => {
  return {};
};

export const updatePassword = () => {
  return {};
};
