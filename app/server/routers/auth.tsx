import { ORPCError } from '@orpc/client';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import i18n from '@/lib/i18n';

import EmailLoginCode from '@/emails/templates/login-code';
import EmailLoginNotFound from '@/emails/templates/login-not-found';
import {
  VALIDATION_RETRY_DELAY_IN_SECONDS,
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
} from '@/features/auth/utils';
import { zUserAuthorization, zUserWithEmail } from '@/features/user/schemas';
import {
  deleteUsedCode,
  generateCode,
  validateCode,
} from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { getUserLanguage } from '@/server/config/i18n';
import { publicProcedure } from '@/server/config/orpc';
import { zVerificationCodeValidate } from '@/features/auth/schemas';
import { zUserAccount } from '@/features/account/schemas';
import { createSession } from '@/server/config/session';
import { User } from '@prisma/client';

const tags = ['auth'];

export default {
  checkAuthenticated: publicProcedure
    .route({
      method: 'GET',
      path: '/auth/check',
      tags,
    })
    .input(z.object({}).default({}))
    .output(
      z.object({
        isAuthenticated: z.boolean(),
        authorizations: z.array(zUserAuthorization()).optional(),
      })
    )
    .handler(({ context }) => {
      context.logger.info(`User ${context.user ? 'is' : 'is not'} logged`);
      return {
        isAuthenticated: !!context.user,
        authorizations: context.user?.authorizations,
      };
    }),

  login: publicProcedure
    .route({
      method: 'POST',
      path: '/auth/login',
      tags,
    })
    .input(
      zUserWithEmail().pick({
        email: true,
        language: true,
      })
    )
    .output(z.object({ token: z.string() }))
    .handler(async ({ context, input }) => {
      context.logger.info('Retrieving user info by email');
      const user = await context.db.user.findUnique({
        where: { email: input.email },
      });

      context.logger.info('Creating token');
      const token = randomUUID();

      if (!user) {
        context.logger.warn(
          'User not found, silent error for security reasons'
        );

        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:loginNotFound.subject', {
            lng: getUserLanguage(input.language),
          }),
          template: (
            <EmailLoginNotFound language={getUserLanguage(input.language)} />
          ),
        });

        return {
          token,
        };
      }

      if (user.accountStatus === 'DISABLED') {
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Account is disabled',
        });
      }

      if (user.accountStatus !== 'ENABLED') {
        context.logger.warn('Invalid user, silent error for security reasons');

        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:loginNotFound.subject', {
            lng: getUserLanguage(input.language),
          }),
          template: (
            <EmailLoginNotFound language={getUserLanguage(input.language)} />
          ),
        });
        return {
          token,
        };
      }

      context.logger.info('Creating code');
      const code = await generateCode();

      context.logger.info('Saving code and token to database');
      await context.db.verificationToken.create({
        data: {
          userId: user.id,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code: code.hashed,
          token,
        },
      });

      context.logger.info('Send email with code');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:loginCode.subject', {
          lng: getUserLanguage(user.language),
        }),
        template: (
          <EmailLoginCode
            language={getUserLanguage(user.language)}
            name={user.name ?? ''}
            code={code.readable}
          />
        ),
      });

      return {
        token,
      };
    }),

  loginValidate: publicProcedure
    .route({
      method: 'POST',
      path: '/auth/login/validate/{token}',
      tags,
      description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
    })
    .input(zVerificationCodeValidate())
    .output(z.object({ token: z.string(), account: zUserAccount() }))
    .handler(async ({ context, input }) => {
      const { verificationToken } = await validateCode({
        logger: context.logger,
        ...input,
      });

      context.logger.info('Updating user');
      let user: User;
      try {
        user = await context.db.user.update({
          where: { id: verificationToken.userId, accountStatus: 'ENABLED' },
          data: {
            isEmailVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } catch {
        context.logger.warn('Failed to update the user, probably not enabled');
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Failed to authenticate the user',
        });
      }

      await deleteUsedCode({
        logger: context.logger,
        token: verificationToken.token,
      });

      context.logger.info('Create the session');
      const sessionId = await createSession(verificationToken.userId);

      return {
        account: user,
        token: sessionId,
      };
    }),
};
