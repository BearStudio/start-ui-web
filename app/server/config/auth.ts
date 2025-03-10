import { ORPCError } from '@orpc/client';
import { generateRandomString, RandomReader } from '@oslojs/crypto/random';
import { VerificationToken } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';

import { envClient } from '@/env/client';
import {
  getValidationRetryDelayInSeconds,
  VALIDATION_CODE_ALLOWED_CHARACTERS,
  VALIDATION_CODE_MOCKED,
} from '@/features/auth/utils';

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
  context,
  code,
  token,
}: {
  context: TODO;
  code: string;
  token: string;
}): Promise<{ verificationToken: VerificationToken }> {
  context.logger.info('Removing expired verification tokens from database');
  await context.db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  context.logger.info('Checking if verification token exists');
  const verificationToken = await context.db.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    context.logger.warn('Verification token does not exist');
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  const retryDelayInSeconds = getValidationRetryDelayInSeconds(
    verificationToken.attempts
  );

  context.logger.info('Check last attempt date');
  if (
    dayjs().isBefore(
      dayjs(verificationToken.lastAttemptAt).add(retryDelayInSeconds, 'seconds')
    )
  ) {
    context.logger.warn('Last attempt was to close');
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  context.logger.info('Checking code');
  const isCodeValid = await bcrypt.compare(code, verificationToken.code);

  if (!isCodeValid) {
    context.logger.warn('Invalid code');

    try {
      context.logger.info('Updating token attempts');
      await context.db.verificationToken.update({
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
      context.logger.error('Failed to update token attempts');
    }

    throw new ORPCError('UNAUTHORIZED', {
      message: 'Failed to authenticate the user',
    });
  }

  return { verificationToken };
}

export async function deleteUsedCode({
  context,
  token,
}: {
  context: TODO;
  token: string;
}) {
  context.logger.info('Deleting used token');
  try {
    await context.db.verificationToken.delete({
      where: { token },
    });
  } catch {
    context.logger.warn('Failed to delete the used token');
  }
}
