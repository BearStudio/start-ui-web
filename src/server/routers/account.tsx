import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import EmailDeleteAccountCode from '@/emails/templates/delete-account-code';
import EmailUpdateAlreadyUsed from '@/emails/templates/email-update-already-used';
import EmailUpdateCode from '@/emails/templates/email-update-code';
import {
  zUserAccount,
  zUserAccountWithEmail,
} from '@/features/account/schemas';
import { zVerificationCodeValidate } from '@/features/auth/schemas';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import { doesFileUrlMatchesBucket } from '@/files/utils';
import i18n from '@/lib/i18n/server';
import {
  deleteUsedCode,
  generateCode,
  validateCode,
} from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const accountRouter = createTRPCRouter({
  get: protectedProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/account/me',
        protect: true,
        tags: ['account'],
      },
    })
    .input(z.void())
    .output(zUserAccount())
    .query(async ({ ctx }) => {
      ctx.logger.info('Return the current user');
      return ctx.user;
    }),

  update: protectedProcedure()
    .meta({
      openapi: {
        method: 'PUT',
        path: '/account/me',
        protect: true,
        tags: ['account'],
      },
    })
    .input(
      zUserAccount().pick({
        image: true,
        name: true,
        language: true,
      })
    )
    .output(zUserAccount())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Updating the user');

        if (input.image && !doesFileUrlMatchesBucket(input.image)) {
          ctx.logger.error('Avatar URL do not match S3 bucket URL');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Avatar URL do not match S3 bucket URL',
          });
        }

        return await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: {
            ...input,
            image: input.image
              ? `${input.image}?${Date.now()}` // Allows to update the cache when the user changes his account
              : null,
          },
        });
      } catch (e) {
        ctx.logger.warn('An error occured while updating the user');
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  updateEmail: protectedProcedure()
    .meta({
      openapi: {
        method: 'PUT',
        path: '/account/update-email/',
        protect: true,
        tags: ['account'],
      },
    })
    .input(zUserAccountWithEmail().pick({ email: true }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info('Checking existing email');
      if (ctx.user.email === input.email) {
        ctx.logger.warn('Same email for current user and input');
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Same email for current user and input',
        });
      }

      const token = randomUUID();

      ctx.logger.info('Checking if new email is already used');
      const existingEmail = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (existingEmail) {
        ctx.logger.warn(
          'Email already used, silent error for security reasons'
        );
        ctx.logger.info('Send an email to the already used email');
        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:emailUpdateAlreadyUsed.subject', {
            lng: existingEmail.language,
          }),
          template: (
            <EmailUpdateAlreadyUsed
              language={existingEmail.language}
              name={existingEmail.name ?? ''}
              email={input.email}
            />
          ),
        });
        return {
          token,
        };
      }

      // If we got here, the user can update the email
      // and we send the email to verify the new email.
      ctx.logger.info('Creating code');
      const code = await generateCode();

      ctx.logger.info('Creating verification token in database');
      await ctx.db.verificationToken.create({
        data: {
          userId: ctx.user.id,
          token,
          email: input.email,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code: code.hashed,
        },
      });

      ctx.logger.info('Sending email with verification code');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:emailUpdate.subject', {
          lng: ctx.user.language,
        }),
        template: (
          <EmailUpdateCode
            language={ctx.user.language}
            name={ctx.user.name ?? ''}
            code={code.readable}
          />
        ),
      });

      return {
        token,
      };
    }),

  updateEmailValidate: protectedProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/account/update-email/',
        protect: true,
        tags: ['account'],
      },
    })
    .input(zVerificationCodeValidate())
    .output(zUserAccount())
    .mutation(async ({ ctx, input }) => {
      const { verificationToken } = await validateCode({
        ctx,
        ...input,
      });

      if (!verificationToken.email) {
        ctx.logger.error('verificationToken does not contain an email');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      ctx.logger.info('Update the user email');
      const user = await ctx.db.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          email: verificationToken.email,
        },
      });

      await deleteUsedCode({ ctx, token: verificationToken.token });

      return user;
    }),

  deleteRequest: protectedProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/account/delete/request',
        protect: true,
        tags: ['account'],
      },
    })
    .input(z.void())
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx }) => {
      const token = randomUUID();

      if (!ctx.user.email) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong. User has no email.',
        });
      }

      // We send the email to verify the account before delete.
      ctx.logger.info('Creating code');
      const code = await generateCode();

      ctx.logger.info('Creating verification token in database');
      await ctx.db.verificationToken.create({
        data: {
          userId: ctx.user.id,
          token,
          email: ctx.user.email,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code: code.hashed,
        },
      });

      ctx.logger.info('Sending email with verification code');
      await sendEmail({
        to: ctx.user.email,
        subject: i18n.t('emails:deleteAccountCode.subject', {
          lng: ctx.user.language,
        }),
        template: (
          <EmailDeleteAccountCode
            language={ctx.user.language}
            name={ctx.user.name ?? ''}
            code={code.readable}
          />
        ),
      });

      return {
        token,
      };
    }),

  deleteValidate: protectedProcedure()
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/account/delete/validate/',
        protect: true,
        tags: ['account'],
      },
    })
    .input(zVerificationCodeValidate())
    .output(zUserAccount())
    .mutation(async ({ ctx, input }) => {
      const { verificationToken } = await validateCode({
        ctx,
        ...input,
      });

      ctx.logger.info('Delete the account');
      const user = await ctx.db.user.delete({
        where: {
          id: verificationToken.userId,
        },
      });

      await deleteUsedCode({ ctx, token: verificationToken.token });

      return user;
    }),
});
