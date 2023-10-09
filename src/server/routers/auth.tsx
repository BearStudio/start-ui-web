import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';

import EmailActivateAccount from '@/emails/templates/activate-account';
import EmailLoginCode from '@/emails/templates/login-code';
import { env } from '@/env.mjs';
import {
  VALIDATION_CODE_MOCKED,
  VALIDATION_RETRY_DELAY_IN_SECONDS,
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
  getRetryDelayInSeconds as getValidationRetryDelayInSeconds,
} from '@/features/auth/utils';
import i18n from '@/lib/i18n/server';
import { AUTH_COOKIE_NAME } from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, publicProcedure } from '@/server/config/trpc';

export const authRouter = createTRPCRouter({
  checkAuthenticated: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/check',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(z.boolean())
    .query(async ({ ctx }) => {
      ctx.logger.debug(`User ${!!ctx.user ? 'is' : 'is not'} logged`);

      return !!ctx.user;
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
      },
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Retrieving user info by email');
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      ctx.logger.debug('Creating token');
      const token = await randomUUID();

      if (!user) {
        ctx.logger.warn('User not found');
        return {
          token,
        };
      }

      if (!user.activated || !user.emailVerified) {
        ctx.logger.warn('Invalid user');
        return {
          token,
        };
      }

      ctx.logger.debug('Creating code');
      const code =
        env.NODE_ENV === 'development' || env.NEXT_PUBLIC_IS_DEMO
          ? VALIDATION_CODE_MOCKED
          : randomInt(0, 999999).toString().padStart(6, '0');

      ctx.logger.debug('Saving code and token to database');
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code,
          token,
        },
      });

      ctx.logger.debug('Send email with code');
      await sendEmail({
        to: input.email,
        subject: 'TODO',
        template: <EmailLoginCode language={user.language} code={code} />,
      });

      return {
        token,
      };
    }),

  loginValidate: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login/validate/{token}',
        tags: ['auth'],
        description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
      },
    })
    .input(z.object({ code: z.string().length(6), token: z.string().uuid() }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Removing expired verification tokens from database');
      await ctx.db.verificationToken.deleteMany({
        where: { expires: { lt: new Date() } },
      });

      ctx.logger.debug('Checking if verification token exists');
      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: {
          token: input.token,
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

      ctx.logger.debug(
        {
          retryDelayInSeconds,
        },
        'Check last attempt date'
      );
      if (
        dayjs().isBefore(
          dayjs(verificationToken.lastAttemptAt).add(
            retryDelayInSeconds,
            'seconds'
          )
        )
      ) {
        ctx.logger.warn('Last attempt was to close');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to authenticate the user',
        });
      }

      ctx.logger.debug('Checking code');
      if (verificationToken.code !== input.code) {
        ctx.logger.warn('Invalid code');

        try {
          ctx.logger.debug('Updating token attempts');
          await ctx.db.verificationToken.update({
            where: {
              token: input.token,
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

      ctx.logger.debug('Encoding JWT');
      const userJwt = await jwt.sign(
        { id: verificationToken.userId },
        env.AUTH_SECRET
      );
      if (!userJwt) {
        ctx.logger.error('Failed to encode JWT');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      ctx.logger.debug('Deleting used token');
      try {
        await ctx.db.verificationToken.delete({
          where: { token: verificationToken.token },
        });
      } catch (e) {
        ctx.logger.warn('Failed to delete the used token');
      }

      ctx.logger.debug('Updating user');
      try {
        await ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: {
            lastLoginAt: new Date(),
            emailVerified: true,
          },
        });
      } catch (e) {
        ctx.logger.error('Failed to update the user');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      ctx.logger.debug('Set auth cookie');
      cookies().set({
        name: AUTH_COOKIE_NAME,
        value: userJwt,
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
      });

      return {
        token: userJwt,
      };
    }),

  logout: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/logout',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) => {
      ctx.logger.debug('Delete auth cookie');
      cookies().delete('auth');
    }),

  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        language: z.string(),
      })
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      // 👉 check si le compte existe
      // 👉 s'il existe et s'il est pas "emailVerified"
      // 👉 s'il existe pas on le créé sinon on l'update sur l'email
      // 👉 envoit code par email
      // 👉 redirect flow loginValidate

      let user;
      try {
        ctx.logger.debug('Create user');
        user = await ctx.db.user.create({
          data: {
            email: input.email.toLowerCase().trim(),
            name: input.name,
            language: input.language,
          },
        });
      } catch (e) {
        ctx.logger.warn('Failed to create user');
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
      ctx.logger.debug('Sign JWT');
      const token = jwt.sign({ id: user.id }, env.AUTH_SECRET);
      ctx.logger.debug('Create verification token in database');
      // TODO
      // await ctx.db.verificationToken.create({
      //   data: {
      //     userId: user.id,
      //     token,
      //     expires: dayjs().add(1, 'hour').toDate(),
      //   },
      // });
      const link = `${env.NEXT_PUBLIC_BASE_URL}/register/activate?token=${token}`;
      ctx.logger.debug('Send email');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:activateAccount.subject', {
          lng: user.language,
        }),
        template: (
          <EmailActivateAccount
            language={user.language}
            name={user.name ?? ''}
            link={link}
          />
        ),
      });
      return undefined;
    }),
});
