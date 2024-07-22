import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia, TimeSpan } from 'lucia';

import { env } from '@/env.mjs';
import { UserAccount } from '@/features/account/schemas';
import { UserAccountStatus } from '@/features/users/schemas';

import { db } from './db';

const adapter = new PrismaAdapter(db.session, db.user); // your adapter

export const AUTH_COOKIE_NAME = 'auth';

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(4, 'w'),
  sessionCookie: {
    name: AUTH_COOKIE_NAME,
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      sameSite: 'strict',
      // set to `true` when using HTTPS
      secure: env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => attributes,
});

// IMPORTANT!
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: UserAccount & {
      accountStatus: UserAccountStatus;
    };
  }
}
