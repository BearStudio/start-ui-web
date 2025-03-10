import { ORPCError } from '@orpc/client';
import { generateRandomString, RandomReader } from '@oslojs/crypto/random';
import { VerificationToken } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { Logger } from 'pino';

import { envClient } from '@/env/client';
import {
  getValidationRetryDelayInSeconds,
  VALIDATION_CODE_ALLOWED_CHARACTERS,
  VALIDATION_CODE_MOCKED,
} from '@/features/auth/utils';
import { db } from '@/server/config/db';

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

export async function generateCode() {
  const code =
    import.meta.dev || envClient.VITE_IS_DEMO
      ? VALIDATION_CODE_MOCKED
      : generateRandomString(random, VALIDATION_CODE_ALLOWED_CHARACTERS, 6);
  return {
    hashed: await bcrypt.hash(code, 12),
    readable: code,
  };
}

export async function validateCode({
  logger,
  code,
  token,
}: {
  logger: Logger;
  code: string;
  token: string;
}): Promise<{ verificationToken: VerificationToken }> {
  logger.info('Removing expired verification tokens from database');
  await db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  logger.info('Checking if verification token exists');
  const verificationToken = await db.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    logger.warn('Verification token does not exist');
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  const retryDelayInSeconds = getValidationRetryDelayInSeconds(
    verificationToken.attempts
  );

  logger.info('Check last attempt date');
  if (
    dayjs().isBefore(
      dayjs(verificationToken.lastAttemptAt).add(retryDelayInSeconds, 'seconds')
    )
  ) {
    logger.warn('Last attempt was to close');
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  logger.info('Checking code');
  const isCodeValid = await bcrypt.compare(code, verificationToken.code);

  if (!isCodeValid) {
    logger.warn('Invalid code');

    try {
      logger.info('Updating token attempts');
      await db.verificationToken.update({
        where: {
          token,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
    } catch {
      logger.error('Failed to update token attempts');
    }

    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  return { verificationToken };
}

export async function deleteUsedCode({
  logger,
  token,
}: {
  logger: Logger;
  token: string;
}) {
  logger.info('Deleting used token');
  try {
    await db.verificationToken.delete({
      where: { token },
    });
  } catch {
    logger.warn('Failed to delete the used token');
  }
}
