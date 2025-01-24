import { cache } from 'react';

import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { Session, User } from '@prisma/client';
import { cookies, headers } from 'next/headers';
import { getRandomValues } from 'node:crypto';

import { env } from '@/env.mjs';
import { db } from '@/server/config/db';

export const AUTH_COOKIE_NAME = 'session';
const ENTROPY_BYTES_SIZE = 20;

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token =
      headers().get('Authorization')?.split('Bearer ')[1] ??
      // Get session from cookies
      cookies().get(AUTH_COOKIE_NAME)?.value;

    if (!token)
      return {
        user: null,
        session: null,
      };

    return await validateSession(token);
  }
);

export async function createSession(userId: string): Promise<string> {
  await clearExpiredSessions();

  const token = generateSessionToken();
  const session = await storeSessionToken(token, userId);
  setSessionTokenCookie(token, session.expiresAt);

  return token;
}

export async function clearExpiredSessions() {
  await db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

export async function validateSession(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = generateSessionIdFromToken(token);
  const result = await db.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });
  if (result === null) {
    clearSessionCookie();
    return { session: null, user: null };
  }
  const { user, ...session } = result;

  if (user?.accountStatus !== 'ENABLED') {
    invalidateSession(sessionId);
    return {
      user: null,
      session: null,
    };
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    invalidateSession(sessionId);
    return { session: null, user: null };
  }

  await refreshSession(session);
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } });
  clearSessionCookie();
}

// session expiresAt refresh based on half-life
export async function refreshSession(session: Session): Promise<void> {
  if (
    Date.now() >=
    session.expiresAt.getTime() - (1000 * env.SESSION_EXPIRATION_SECONDS) / 2
  ) {
    session.expiresAt = new Date(
      Date.now() + 1000 * env.SESSION_EXPIRATION_SECONDS
    );
    await db.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }
}

async function storeSessionToken(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = generateSessionIdFromToken(token);
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * env.SESSION_EXPIRATION_SECONDS),
  };
  await db.session.create({
    data: session,
  });

  return session;
}

function generateSessionToken(): string {
  const bytes = new Uint8Array(ENTROPY_BYTES_SIZE);
  getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

// We store the token in a hashed format for security reasons
function generateSessionIdFromToken(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

function clearSessionCookie(): void {
  cookies().set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
