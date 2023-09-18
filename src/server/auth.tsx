import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { db } from '@/server/db';

/**
 * getServerAuthSession
 */
export const getServerAuthSession = async () => {
  const token = cookies().get('auth')?.value;

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
