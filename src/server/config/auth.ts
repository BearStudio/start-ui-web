import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

import { env } from '@/env.mjs';
import { db } from '@/server/config/db';

export const AUTH_COOKIE_NAME = 'auth';

/**
 * getServerAuthSession
 */
export const getServerAuthSession = async () => {
  const token =
    // Get from Headers
    headers().get('Authorization')?.split('Bearer ')[1] ??
    // Get from Cookies
    cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const jwtDecoded = decodeJwt(token);

  if (!jwtDecoded?.id) {
    return null;
  }

  return await db.user.findUnique({
    where: { id: jwtDecoded.id, activated: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      language: true,
      activated: true,
      emailVerified: true,
    },
  });
};

export const decodeJwt = (token: string) => {
  const jwtDecoded = jwt.verify(token, env.AUTH_SECRET);
  if (!jwtDecoded || typeof jwtDecoded !== 'object' || !('id' in jwtDecoded)) {
    return null;
  }
  return jwtDecoded;
};
