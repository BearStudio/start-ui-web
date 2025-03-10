import { ORPCError } from '@orpc/client';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import i18n from '@/lib/i18n';

import EmailLoginCode from '@/emails/templates/login-code';
import EmailLoginNotFound from '@/emails/templates/login-not-found';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import { zUserAuthorization, zUserWithEmail } from '@/features/user/schemas';
import { generateCode } from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { getUserLanguage } from '@/server/config/i18n';
import { publicProcedure } from '@/server/config/orpc';

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
};
