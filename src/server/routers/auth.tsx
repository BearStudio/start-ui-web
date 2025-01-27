import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import EmailLoginCode from '@/emails/templates/login-code';
import { EmailLoginNotFound } from '@/emails/templates/login-not-found';
import EmailRegisterCode from '@/emails/templates/register-code';
import RegisterEmailAlreadyUsed from '@/emails/templates/register-email-already-used';
import { zUserAccount } from '@/features/account/schemas';
import { zVerificationCodeValidate } from '@/features/auth/schemas';
import {
  VALIDATION_RETRY_DELAY_IN_SECONDS,
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
} from '@/features/auth/utils';
import { zUserAuthorization, zUserWithEmail } from '@/features/users/schemas';
import i18n from '@/lib/i18n/server';
import {
  deleteUsedCode,
  generateCode,
  validateCode,
} from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createSession, invalidateSession } from '@/server/config/session';
import { createTRPCRouter, publicProcedure } from '@/server/config/trpc';

export const authRouter = createTRPCRouter({
  checkAuthenticated: publicProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/check',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(
      z.object({
        isAuthenticated: z.boolean(),
        authorizations: z.array(zUserAuthorization()).optional(),
      })
    )
    .query(async ({ ctx }) => {
      ctx.logger.info(`User ${ctx.user ? 'is' : 'is not'} logged`);

      return {
        isAuthenticated: !!ctx.user,
        authorizations: ctx.user?.authorizations,
      };
    }),

  login: publicProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
      },
    })
    .input(
      zUserWithEmail().pick({
        email: true,
        language: true,
      })
    )
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info('Retrieving user info by email');
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      ctx.logger.info('Creating token');
      const token = randomUUID();

      if (!user) {
        ctx.logger.warn('User not found, silent error for security reasons');

        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:loginNotFound.subject', {
            lng: input.language,
          }),
          template: <EmailLoginNotFound language={input.language} />,
        });

        return {
          token,
        };
      }

      if (user.accountStatus === 'DISABLED') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account is disabled',
        });
      }

      if (user.accountStatus !== 'ENABLED') {
        ctx.logger.warn('Invalid user, silent error for security reasons');

        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:loginNotFound.subject', {
            lng: input.language,
          }),
          template: <EmailLoginNotFound language={input.language} />,
        });
        return {
          token,
        };
      }

      ctx.logger.info('Creating code');
      const code = await generateCode();

      ctx.logger.info('Saving code and token to database');
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code: code.hashed,
          token,
        },
      });

      ctx.logger.info('Send email with code');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:loginCode.subject', { lng: user.language }),
        template: (
          <EmailLoginCode
            language={user.language}
            name={user.name ?? ''}
            code={code.readable}
          />
        ),
      });

      return {
        token,
      };
    }),

  loginValidate: publicProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login/validate/{token}',
        tags: ['auth'],
        description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
      },
    })
    .input(zVerificationCodeValidate())
    .output(z.object({ token: z.string(), account: zUserAccount() }))
    .mutation(async ({ ctx, input }) => {
      const { verificationToken } = await validateCode({
        ctx,
        ...input,
      });

      ctx.logger.info('Updating user');
      let user: User;
      try {
        user = await ctx.db.user.update({
          where: { id: verificationToken.userId, accountStatus: 'ENABLED' },
          data: {
            isEmailVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } catch {
        ctx.logger.warn('Failed to update the user, probably not enabled');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to authenticate the user',
        });
      }

      await deleteUsedCode({ ctx, token: verificationToken.token });

      ctx.logger.info('Create the session');
      const sessionId = await createSession(verificationToken.userId);

      return {
        account: user,
        token: sessionId,
      };
    }),

  logout: publicProcedure()
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
      ctx.logger.info('Delete auth cookie');

      if (!ctx.session) {
        ctx.logger.warn('No session found');
        return;
      }

      await invalidateSession(ctx.session.id);
    }),

  register: publicProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
      },
    })
    .input(
      zUserWithEmail().required().pick({
        email: true,
        name: true,
        language: true,
      })
    )
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info('Checking if the user exists');
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      ctx.logger.info('Creating token');
      const token = randomUUID();

      let newUser;
      // If the user doesn't exist, we create a new one.
      if (!user) {
        try {
          ctx.logger.info('Creating a new user');
          newUser = await ctx.db.user.create({
            data: {
              email: input.email,
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
      }
      // If the user exists and email is not verified, it means the user (or
      // someone else) did register using this email but did not complete the
      // validation flow. So we update the data according to the new
      // informations.
      else if (user && user.accountStatus === 'NOT_VERIFIED') {
        newUser = await ctx.db.user.update({
          where: {
            email: input.email,
          },
          data: {
            language: input.language,
            name: input.name,
          },
        });
      }

      if (!newUser) {
        ctx.logger.error(
          'An error occured while creating or updating the user, the address may already exists, silent error for security reasons'
        );

        if (user?.email) {
          ctx.logger.info('Send an email to the already used email');
          await sendEmail({
            to: input.email,
            subject: i18n.t('emails:registerEmailAlreadyUsed.subject', {
              lng: user.language,
            }),
            template: (
              <RegisterEmailAlreadyUsed
                language={user.language}
                name={user.name ?? ''}
                email={input.email}
              />
            ),
          });
        }

        return {
          token,
        };
      }

      // If we got here, the user exists and email is verified, no need to
      // register, send the email to login the user.
      ctx.logger.info('Creating code');
      const code = await generateCode();

      ctx.logger.info('Creating verification token in database');
      await ctx.db.verificationToken.create({
        data: {
          userId: newUser.id,
          token,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code: code.hashed,
        },
      });

      ctx.logger.info('Sending email to register');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:registerCode.subject', {
          lng: newUser.language,
        }),
        template: (
          <EmailRegisterCode
            language={newUser.language}
            name={newUser.name ?? ''}
            code={code.readable}
          />
        ),
      });

      return {
        token,
      };
    }),
  registerValidate: publicProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register/validate/{token}',
        tags: ['auth'],
        description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
      },
    })
    .input(zVerificationCodeValidate())
    .output(z.object({ token: z.string(), account: zUserAccount() }))
    .mutation(async ({ ctx, input }) => {
      const { verificationToken } = await validateCode({
        ctx,
        ...input,
      });

      ctx.logger.info('Updating user');
      let user: User;
      try {
        user = await ctx.db.user.update({
          where: {
            id: verificationToken.userId,
            accountStatus: 'NOT_VERIFIED',
          },
          data: {
            isEmailVerified: true,
            lastLoginAt: new Date(),
            accountStatus: 'ENABLED',
          },
        });
      } catch {
        ctx.logger.warn('Failed to update the user, probably already verified');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to authenticate the user',
        });
      }

      await deleteUsedCode({ ctx, token: verificationToken.token });

      ctx.logger.info('Create the session');
      const sessionId = await createSession(verificationToken.userId);

      return {
        account: user,
        token: sessionId,
      };
    }),
});
