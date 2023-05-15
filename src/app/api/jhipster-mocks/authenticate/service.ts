import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { db } from '@/app/api/jhipster-mocks/db';

type LoginParams = {
  login: string;
  password: string;
};

export const login = async ({ login, password }: LoginParams) => {
  const user = await db.user.findUnique({ where: { login } });

  if (!user?.password || !user?.activated) {
    return undefined;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return undefined;
  }

  return jwt.sign({ id: user.id }, process.env.AUTH_SECRET);
};
