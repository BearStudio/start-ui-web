import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

import { db } from '@/server/db';

/**
 * getServerAuthSession
 */
export const getServerAuthSession = async () => {
  const token =
    headers().get('Authorization')?.split('Bearer ')[1] ??
    cookies().get('auth')?.value;

  if (!token) {
    return null;
  }

  const jwtDecoded = jwt.verify(token, process.env.AUTH_SECRET);

  if (!jwtDecoded || typeof jwtDecoded !== 'object' || !('id' in jwtDecoded)) {
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
