import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import i18n from '@/lib/i18n';

import { TemplateEmailAlreadyUsed } from '@/emails/templates/email-already-used';
import { zFormFieldsOnboarding, zOtp } from '@/features/auth/schema';
import { auth } from '@/server/auth';
import { sendEmail } from '@/server/email';
import { protectedProcedure } from '@/server/orpc';
import { getUserLanguage } from '@/server/utils';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/account/submit-onboarding',
      tags,
    })
    .input(zFormFieldsOnboarding())
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          onboardedAt: new Date(),
        },
      });
    }),

  changeEmailInit: protectedProcedure({
    permission: {
      account: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/account/change-email/init',
      tags,
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.void())
    .handler(async ({ input, context }) => {
      const emailAlreadyUsed = await context.db.user.findUnique({
        where: { email: input.email },
      });

      if (emailAlreadyUsed) {
        context.logger.warn(
          'Email already used, silent error for security reasons'
        );
        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:emailAlreadyUsed.subject', {
            lng: getUserLanguage(),
          }),
          template: (
            <TemplateEmailAlreadyUsed
              language={getUserLanguage()}
              email={input.email}
            />
          ),
        });
        return;
      }

      context.logger.info('Send OTP email');
      const response = await auth.api.sendVerificationOTP({
        body: { email: input.email, type: 'email-verification' },
      });
      if (!response.success) {
        context.logger.warn('Failed to send OTP email');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
  changeEmailVerify: protectedProcedure({
    permission: {
      account: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/account/change-email/verify',
      tags,
    })
    .input(z.object({ email: z.string().email(), otp: zOtp() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Find the verification matching email and otp');
      const verification = await context.db.verification.findFirst({
        where: {
          identifier: `email-verification-otp-${input.email}`,
          value: input.otp,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verification) {
        context.logger.warn('Verification not found');
        throw new ORPCError('BAD_REQUEST');
      }

      try {
        await context.db.verification.delete({
          where: {
            id: verification.id,
          },
        });
      } catch {
        context.logger.error('Failed to delete the used verification item');
      }

      context.logger.info('Update user the email');
      await context.db.user.update({
        where: { id: context.user.id },
        data: {
          email: input.email,
          emailVerified: true,
        },
      });
    }),
};
