import { VerificationToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { randomInt } from 'node:crypto';

import { env } from '@/env.mjs';
import {
  VALIDATION_CODE_MOCKED,
  getValidationRetryDelayInSeconds,
} from '@/features/auth/utils';
import { AppContext } from '@/server/config/trpc';

import { lucia } from './lucia';

export const AUTH_COOKIE_NAME = 'auth';

/**
 * getServerAuthSession
 */
export const getServerAuthSession = async () => {
  const sessionId =
    lucia.readBearerToken('Authorizations') ??
    cookies().get(lucia.sessionCookieName)?.value;

  if (!sessionId)
    return {
      user: null,
      session: null,
    };

  const { user, session } = await lucia.validateSession(sessionId);

  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  return {
    user,
    session,
  };
};

export const setAuthCookie = (token: string) => {
  cookies().set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    expires: dayjs().add(1, 'year').toDate(),
  });
};

export async function generateCode() {
  const code =
    env.NODE_ENV === 'development' || env.NEXT_PUBLIC_IS_DEMO
      ? VALIDATION_CODE_MOCKED
      : randomInt(0, 999999).toString().padStart(6, '0');
  return {
    hashed: await bcrypt.hash(code, 12),
    readable: code,
  };
}

export async function validateCode({
  ctx,
  code,
  token,
}: {
  ctx: AppContext;
  code: string;
  token: string;
}): Promise<{ verificationToken: VerificationToken }> {
  ctx.logger.info('Removing expired verification tokens from database');
  await ctx.db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  ctx.logger.info('Checking if verification token exists');
  const verificationToken = await ctx.db.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    ctx.logger.warn('Verification token does not exist');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Failed to authenticate the user',
    });
  }

  const retryDelayInSeconds = getValidationRetryDelayInSeconds(
    verificationToken.attempts
  );

  ctx.logger.info('Check last attempt date');
  if (
    dayjs().isBefore(
      dayjs(verificationToken.lastAttemptAt).add(retryDelayInSeconds, 'seconds')
    )
  ) {
    ctx.logger.warn('Last attempt was to close');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Failed to authenticate the user',
    });
  }

  ctx.logger.info('Checking code');
  const isCodeValid = await bcrypt.compare(code, verificationToken.code);

  if (!isCodeValid) {
    ctx.logger.warn('Invalid code');

    try {
      ctx.logger.info('Updating token attempts');
      await ctx.db.verificationToken.update({
        where: {
          token,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
    } catch (e) {
      ctx.logger.error('Failed to update token attempts');
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Failed to authenticate the user',
    });
  }

  return { verificationToken };
}

export async function deleteUsedCode({
  ctx,
  token,
}: {
  ctx: AppContext;
  token: string;
}) {
  ctx.logger.info('Deleting used token');
  try {
    await ctx.db.verificationToken.delete({
      where: { token },
    });
  } catch (e) {
    ctx.logger.warn('Failed to delete the used token');
  }
}

export async function createSession(userId: string) {
  const session = await lucia.createSession(userId, {
    expiresAt: dayjs().add(1, 'year').toDate(),
  });

  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function deleteSession(sessionId: string) {
  await lucia.invalidateSession(sessionId);

  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
