import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import EmailAddressChange from '@/emails/templates/email-address-change';
import { env } from '@/env.mjs';
import { zUserAccount } from '@/features/account/schemas';
import { VALIDATION_TOKEN_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';
import i18n from '@/lib/i18n/server';
import {
  deleteUsedCode,
  generateCode,
  validateCode,
} from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { ExtendedTRPCError } from '@/server/config/errors';
import { getS3UploadSignedUrl } from '@/server/config/s3';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const accountRouter = createTRPCRouter({
  get: protectedProcedure()
    .meta({
      openapi: {
        method: 'GET',
        path: '/accounts/me',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(z.void())
    .output(zUserAccount())
    .query(async ({ ctx }) => {
      ctx.logger.info('Getting user');
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          authorizations: true,
          language: true,
        },
      });

      if (!user) {
        ctx.logger.warn('User not found');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return user;
    }),

  update: protectedProcedure()
    .meta({
      openapi: {
        method: 'PUT',
        path: '/accounts/me',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(
      zUserAccount().required().pick({
        image: true,
        name: true,
        language: true,
      })
    )
    .output(zUserAccount())
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.logger.info('Updating the user');
        return await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: input,
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
        path: '/accounts/update-email/',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(
      zUserAccount().pick({
        email: true,
      })
    )
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
        subject: i18n.t('emails:emailAddressChange.subject', {
          lng: ctx.user.language,
        }),
        template: (
          <EmailAddressChange
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
        path: '/accounts/update-email/',
        protect: true,
        tags: ['accounts'],
      },
    })
    .input(
      z.object({
        token: z.string().uuid(),
        code: z.string().length(6),
      })
    )
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
  uploadAvatarPresignedUrl: protectedProcedure()
    .meta({
      openapi: {
        method: 'POST',
        path: '/accounts/avatar-upload-presigned-url',
        tags: ['accounts', 'files'],
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        signedUrl: z.string(),
        key: z.string(),
        futureFileUrl: z.string(),
      })
    )
    .mutation(async ({ ctx }) => {
      const s3 = await getS3UploadSignedUrl({
        key: ctx.user.id,
        acl: 'public-read',
      });
      return {
        signedUrl: s3.signedUrl,
        key: s3.key,
        futureFileUrl: `${env.S3_BUCKET_PUBLIC_URL}/${s3.key}`,
      };
    }),
});
