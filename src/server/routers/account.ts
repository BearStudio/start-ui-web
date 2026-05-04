import { ORPCError } from '@orpc/client';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { zFormFieldsOnboarding } from '@/features/auth/schema';
import { zUser } from '@/features/user/schema';
import { user } from '@/server/db/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['account'];

export default {
  submitOnboarding: protectedProcedure({
    permissions: null,
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
      const [updatedUser] = await context.db
        .update(user)
        .set({
          ...input,
          onboardedAt: new Date(),
        })
        .where(eq(user.id, context.user.id))
        .returning({ id: user.id });

      if (!updatedUser) {
        throw new ORPCError('NOT_FOUND', { message: 'Account not found' });
      }
    }),

  updateInfo: protectedProcedure({
    permissions: null,
  })
    .route({
      method: 'POST',
      path: '/account/info',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Update user');
      const [updatedUser] = await context.db
        .update(user)
        .set({
          name: input.name ?? '',
        })
        .where(eq(user.id, context.user.id))
        .returning({ id: user.id });

      if (!updatedUser) {
        throw new ORPCError('NOT_FOUND', { message: 'Account not found' });
      }
    }),
};
