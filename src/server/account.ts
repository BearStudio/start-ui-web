import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

import {
  UserFormatted,
  formatUserFromDb,
  prepareUserForDb,
} from '@/server/users';
import { db } from '@/server/utils/db';

export const getAccount = async (id: number) => {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      login: true,
      email: true,
      firstName: true,
      lastName: true,
      authorities: true,
      langKey: true,
      activated: true,
    },
  });
  if (!user?.activated) return undefined;
  return formatUserFromDb(user);
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

  const user = await db.user.create({
    data: prepareUserForDb({
      email,
      login,
      password: passwordHash,
      langKey,
    }),
  });

  const token = randomUUID();

  await db.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expires: dayjs().add(1, 'hour').toDate(),
    },
  });

  // REPLACE ME WITH EMAIL SERVICE
  console.log(`👇👇👇👇👇👇👇👇👇👇
✉️ Activation link: ${process.env.NEXT_PUBLIC_BASE_URL}/app/account/activate?key=${token}
👆👆👆👆👆👆👆👆👆👆`);

  return user;
};

type activateAccountParams = {
  token: string;
};

export const activateAccount = async ({ token }: activateAccountParams) => {
  // Clear all expired tokens
  await db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return undefined;
  }

  const [user] = await db.$transaction([
    db.user.update({
      where: { id: verificationToken.userId },
      data: { activated: true },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return user;
};

export const updateAccount = async (
  id: number,
  payload: Partial<UserFormatted>
) => {
  if (!payload) throw new Error('Missing payload');
  const user = await db.user.update({
    where: { id },
    data: prepareUserForDb(payload),
  });
  return formatUserFromDb(user);
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
