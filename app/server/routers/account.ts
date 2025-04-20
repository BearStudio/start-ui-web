import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsOnboarding, zOtp } from '@/features/auth/schema';
import { auth } from '@/server/auth';
import { protectedProcedure } from '@/server/orpc';

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
    .handler(async ({ input }) => {
      // TODO logs
      const response = await auth.api.sendVerificationOTP({
        body: { email: input.email, type: 'email-verification' },
      });
      if (!response.success) {
        // TODO handle errors better
        throw new ORPCError('BAD_REQUEST');
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
      // TODO logs
      const response = await auth.api.verifyEmailOTP({
        body: {
          email: input.email,
          otp: input.otp,
        },
      });

      if (!response.status) {
        // TODO handle errors better
        throw new ORPCError('BAD_REQUEST');
      }

      // TODO logs
      await context.db.user.update({
        where: { id: response.user.id },
        data: {
          ...input,
          email: response.user.email,
          emailVerified: response.user.emailVerified,
        },
      });
    }),
};
