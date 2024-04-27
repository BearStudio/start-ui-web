import { VerificationToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { randomInt } from 'node:crypto';

import { env } from '@/env.mjs';
import {
  VALIDATION_CODE_MOCKED,
  getValidationRetryDelayInSeconds,
} from '@/features/auth/utils';
import { zUser } from '@/features/users/schemas';
import { db } from '@/server/config/db';
import { AppContext } from '@/server/config/trpc';

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

  const userPick = {
    id: true,
    name: true,
    email: true,
    authorizations: true,
    language: true,
    accountStatus: true,
  } as const;

  const user = await db.user.findUnique({
    where: { id: jwtDecoded.id, accountStatus: 'ENABLED' },
    select: userPick,
  });

  if (!user) {
    return null;
  }

  return zUser().pick(userPick).parse(user);
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

export const decodeJwt = (token: string) => {
  try {
    const jwtDecoded = jwt.verify(token, env.AUTH_SECRET);
    if (
      !jwtDecoded ||
      typeof jwtDecoded !== 'object' ||
      !('id' in jwtDecoded)
    ) {
      return null;
    }
    return jwtDecoded;
  } catch {
    return null;
  }
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
}): Promise<{ verificationToken: VerificationToken; userJwt: string }> {
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

  ctx.logger.info('Encoding JWT');
  const userJwt = jwt.sign({ id: verificationToken.userId }, env.AUTH_SECRET);
  if (!userJwt) {
    ctx.logger.error('Failed to encode JWT');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  return { verificationToken, userJwt };
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
